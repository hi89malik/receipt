'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { UploadCloud, ScanLine, CheckCircle, AlertCircle, Calendar, Leaf } from 'lucide-react';

// Define the shape of our data
interface ReceiptItem {
  item: string;
  category: string;
  shelf_life_days: number;
  quantity?: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Effect to simulate progress when loading starts
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setItems([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze receipt');

      setProgress(100);
      const data: ReceiptItem[] = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      setProgress(0);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 text-slate-800 p-8 flex flex-col items-center">

      {/* --- HEADER --- */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
          <Leaf className="w-8 h-8 text-green-500 mr-2" />
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Smart Pantry Tracker
          </h1>
        </div>
        <p className="text-slate-500 max-w-md mx-auto">
          Don't let food go to waste. Scan your receipt to track expiration dates instantly.
        </p>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transition-all hover:shadow-blue-200/50">

        {/* Upload Zone */}
        <div
          className={`relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out
            ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {file ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
                <p className="text-sm font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-green-600">Click to change file</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-100 rounded-full group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Click or drag receipt here
                </p>
                <p className="text-xs text-slate-400">Supports JPG, PNG</p>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`mt-6 w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95
            ${!file || loading
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-purple-500/30 hover:-translate-y-0.5'}`}
        >
          {loading ? (
            <>
              <ScanLine className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ScanLine className="w-5 h-5" />
              <span>Analyze Receipt</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {loading && (
          <div className="mt-6 space-y-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-slate-400 font-medium">
              Gemini is reading your items... {Math.min(progress, 99)}%
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* --- RESULTS GRID --- */}
      {items.length > 0 && (
        <div className="w-full max-w-2xl mt-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-700">Pantry Items</h2>
            <span className="text-sm font-medium px-3 py-1 bg-white rounded-full text-slate-500 shadow-sm border">
              {items.length} detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Visual Status Bar on Left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                  ${item.shelf_life_days < 4 ? 'bg-red-400' : 'bg-green-400'}`}
                />

                <div className="pl-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.item}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                      {item.category}
                    </p>
                  </div>

                  <div className={`flex flex-col items-end text-sm font-medium
                    ${item.shelf_life_days < 4 ? 'text-red-500' : 'text-green-600'}`}
                  >
                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                      <Calendar className="w-3 h-3 mr-1" />
                      {item.shelf_life_days} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}