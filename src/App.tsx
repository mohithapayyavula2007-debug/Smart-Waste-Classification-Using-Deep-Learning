import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Classify from './pages/Classify';
import History from './pages/History';
import Guide from './pages/Guide';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classify" element={<Classify />} />
          <Route path="/history" element={<History />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
