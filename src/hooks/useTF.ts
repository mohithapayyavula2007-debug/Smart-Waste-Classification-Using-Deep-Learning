import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface ClassificationResult {
  className: string;
  probability: number;
}

export interface WasteClassification {
  category: string;
  confidence: number;
  topPredictions: ClassificationResult[];
  categoryId: number | null;
}

// Map ImageNet classes to waste categories
function mapToWasteCategory(className: string): { category: string; categoryId: number } {
  const name = className.toLowerCase();

  // Plastic: bottles, containers, bags, etc.
  if (name.includes('bottle') || name.includes('container') || name.includes('plastic') || name.includes('water bottle') || name.includes('cup') || name.includes('jug')) {
    return { category: 'Plastic', categoryId: 1 };
  }
  // Paper/Cardboard: paper, book, cardboard, magazine, newspaper
  if (name.includes('paper') || name.includes('book') || name.includes('cardboard') || name.includes('magazine') || name.includes('newspaper') || name.includes('carton') || name.includes('envelope')) {
    return { category: 'Paper/Cardboard', categoryId: 2 };
  }
  // Metal: can, aluminum, metal, tin, steel
  if (name.includes('can') || name.includes('aluminum') || name.includes('metal') || name.includes('tin') || name.includes('steel') || name.includes('soda can')) {
    return { category: 'Metal', categoryId: 3 };
  }
  // Glass: glass, jar, wine bottle, beer bottle
  if (name.includes('glass') || name.includes('jar') || name.includes('wine bottle') || name.includes('beer bottle') || name.includes('window')) {
    return { category: 'Glass', categoryId: 4 };
  }
  // Organic/Food: fruit, vegetable, food, banana, apple, meat, bread, coffee
  if (name.includes('fruit') || name.includes('vegetable') || name.includes('food') || name.includes('banana') || name.includes('apple') || name.includes('meat') || name.includes('bread') || name.includes('coffee') || name.includes('tea') || name.includes('orange') || name.includes('citrus')) {
    return { category: 'Organic/Food', categoryId: 5 };
  }
  // Electronic: phone, laptop, computer, mouse, keyboard, screen, monitor, TV, electronic
  if (name.includes('phone') || name.includes('laptop') || name.includes('computer') || name.includes('mouse') || name.includes('keyboard') || name.includes('screen') || name.includes('monitor') || name.includes('tv') || name.includes('television') || name.includes('electronic') || name.includes('camera') || name.includes('printer')) {
    return { category: 'Electronic', categoryId: 6 };
  }
  // Textile: clothing, shirt, shoe, sock, fabric, textile, towel, blanket
  if (name.includes('clothing') || name.includes('shirt') || name.includes('shoe') || name.includes('sock') || name.includes('fabric') || name.includes('textile') || name.includes('towel') || name.includes('blanket') || name.includes('jacket') || name.includes('pants') || name.includes('dress') || name.includes('sweater') || name.includes('jeans')) {
    return { category: 'Textile', categoryId: 7 };
  }
  // Default: General Waste
  return { category: 'General Waste', categoryId: 8 };
}

export function useTensorFlow() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<mobilenet.MobileNet | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        await tf.setBackend('webgl');
        const m = await mobilenet.load();
        if (!cancelled) {
          setModel(m);
          modelRef.current = m;
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load model');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const classify = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<WasteClassification | null> => {
    const m = modelRef.current || model;
    if (!m) return null;
    const predictions = await m.classify(imageElement, 5);
    const top = predictions.map(p => ({ className: p.className, probability: p.probability }));
    const top1 = top[0];
    const mapped = mapToWasteCategory(top1.className);
    return { category: mapped.category, confidence: top1.probability, topPredictions: top, categoryId: mapped.categoryId };
  }, [model]);

  return { model, loading, error, classify };
}
