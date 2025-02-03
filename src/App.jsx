import React, { useState, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import { analyzeImage, renderArtwork, exportArtwork } from './imageProcessor';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);
  const [remix, setRemix] = useState(false);
  const [pixelMe, setPixelMe] = useState(false);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImgPreview(url);
      setPalette([]);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imgPreview) return;
    await analyzeImage({
      imgPreview,
      numColors,
      remix,
      setPalette,
      setProcessing,
      canvas: canvasRef.current,
      pixelMe,
    });
  };

  const handleExportArtwork = (format) => {
    exportArtwork({
      canvas: canvasRef.current,
      format,
    });
  };

  useEffect(() => {
    if (palette.length > 0) {
      renderArtwork({ canvas: canvasRef.current, colors: palette, pixelMe });
    }
  }, [palette, pixelMe, remix]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 flex flex-col items-center p-4">
      <header className="w-full flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold">Colour Art Analyzer</h1>
        <a
          href="https://www.zapt.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-sm"
        >
          Made on ZAPT
        </a>
      </header>
      <main className="w-full max-w-4xl bg-white shadow-lg rounded p-6 box-border">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload a photograph</label>
          <input
            type="file"
            accept="image/*"
            className="box-border cursor-pointer p-2 border rounded w-full"
            onChange={handleFileChange}
            disabled={processing}
          />
        </div>
        {imgPreview && (
          <div className="mb-4">
            <img src={imgPreview} alt="Preview" className="w-full max-h-80 object-contain rounded" />
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Number of colours (1 to 20)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={numColors}
            className="box-border cursor-pointer p-2 border rounded w-full"
            onChange={(e) => setNumColors(Number(e.target.value))}
            disabled={processing}
          />
        </div>
        <div className="flex gap-4 mb-4">
          <button
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAnalyzeImage}
            disabled={processing || !imgPreview}
          >
            {processing ? 'Processing...' : 'Analyze Image'}
          </button>
          <button
            className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setRemix(!remix)}
            disabled={processing || palette.length === 0}
          >
            {remix ? 'Original Order' : 'Remix'}
          </button>
          <button
            className="cursor-pointer bg-purple-500 text-white px-4 py-2 rounded"
            onClick={() => setPixelMe(!pixelMe)}
            disabled={processing || palette.length === 0}
          >
            {pixelMe ? 'Block Mode' : 'Pixel Me'}
          </button>
        </div>
        <div className="flex gap-4 mb-4">
          <button
            className="cursor-pointer bg-indigo-500 text-white px-4 py-2 rounded"
            onClick={() => handleExportArtwork('jpeg')}
            disabled={processing || palette.length === 0}
          >
            Export as JPEG
          </button>
          <button
            className="cursor-pointer bg-indigo-500 text-white px-4 py-2 rounded"
            onClick={() => handleExportArtwork('png')}
            disabled={processing || palette.length === 0}
          >
            Export as PNG
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border rounded"
        />
      </main>
      <footer className="w-full text-center mt-4 text-sm">
        &copy; {new Date().getFullYear()} Colour Art Analyzer. All rights reserved.
      </footer>
    </div>
  );
}