import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, RotateCcw, CheckCircle } from 'lucide-react';
import { useTensorFlow, WasteClassification } from '../hooks/useTF';
import { ClassificationResultComponent } from '../components/ClassificationResult';

export default function Classify() {
  const { model, loading: modelLoading, error: modelError, classify } = useTensorFlow();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<WasteClassification | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url);
    setResult(null);
    setSaved(false);
    setFeedback(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, [handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runClassification = useCallback(async () => {
    if (!imageRef.current || !image) return;
    setClassifying(true);
    try {
      const res = await classify(imageRef.current);
      setResult(res);
      setSaved(false);
    } catch (e) {
      console.error(e);
    } finally {
      setClassifying(false);
    }
  }, [image, classify]);

  const saveClassification = useCallback(async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/classifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: image,
          category_id: result.categoryId,
          predicted_class: result.category,
          confidence: result.confidence,
          details: { top_predictions: result.topPredictions },
        }),
      });
      if (res.ok) setSaved(true);
    } catch (e) {
      console.error(e);
    }
  }, [result, image]);

  const openCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setCameraOpen(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      console.error('Camera error:', e);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        handleFile(file);
      }
    }, 'image/jpeg');
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setCameraOpen(false);
    setStream(null);
  }, [stream, handleFile]);

  const closeCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
    setStream(null);
  }, [stream]);

  const handleFeedback = useCallback(async (type: 'correct' | 'incorrect') => {
    setFeedback(type);
    if (!result) return;
    try {
      // We need the saved classification ID to send feedback. 
      // For simplicity, we create a classification record first if not saved, then patch.
      if (!saved) await saveClassification();
      // Re-fetch latest classification to patch it
      const listRes = await fetch('/api/classifications?limit=1');
      const list = await listRes.json();
      const latest = list[0];
      if (latest) {
        await fetch('/api/classifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: latest.id, feedback: type }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [result, saved, saveClassification]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Classify Waste</h1>
        <p className="text-slate-500 mt-1">Upload an image or capture from camera to identify the waste type.</p>
      </div>

      {modelLoading && (
        <div className="bg-white rounded-xl border border-slate-200/60 p-8 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600">Loading MobileNet model...</p>
        </div>
      )}

      {modelError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error loading model: {modelError}
        </div>
      )}

      {!modelLoading && !modelError && (
        <div className="space-y-4">
          {/* Upload Area */}
          {!image && !cameraOpen && (
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors bg-white"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Drag & drop an image here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Choose File
                </button>
                <button
                  onClick={openCamera}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              </div>
            </div>
          )}

          {/* Camera Preview */}
          <AnimatePresence>
            {cameraOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black rounded-xl overflow-hidden relative"
              >
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                  <button onClick={capturePhoto} className="w-12 h-12 rounded-full bg-white border-4 border-emerald-500" />
                  <button onClick={closeCamera} className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-slate-800">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Preview */}
          {image && !cameraOpen && (
            <div className="bg-white rounded-xl border border-slate-200/60 p-4">
              <div className="relative">
                <img ref={imageRef} src={image} alt="Waste to classify" className="w-full max-h-96 object-contain rounded-lg" />
                <button
                  onClick={() => { setImage(null); setResult(null); setSaved(false); setFeedback(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={runClassification}
                  disabled={classifying}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {classifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Classify
                    </>
                  )}
                </button>
                {result && (
                  <button
                    onClick={saveClassification}
                    disabled={saved}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      saved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <ClassificationResultComponent
              category={result.category}
              confidence={result.confidence}
              topPredictions={result.topPredictions}
              onFeedback={handleFeedback}
              feedback={feedback}
            />
          )}
        </div>
      )}
    </div>
  );
}
