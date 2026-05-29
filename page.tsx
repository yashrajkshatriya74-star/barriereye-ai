"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  ShieldAlert,
  MapPinned,
  Brain,
} from "lucide-react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const analyzeImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setImage(reader.result as string);
      setResult("");
      setLoading(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      setResult(data.result);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    analyzeImage(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      analyzeImage(file);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 rounded-full mb-8">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-300">
            AI Accessibility Intelligence
          </span>
        </div>

        <h1 className="text-6xl font-black leading-tight max-w-4xl">
          BarrierEye AI
        </h1>

        <p className="text-zinc-400 text-xl mt-6 max-w-2xl">
          Real-time accessibility analysis for safer cities.
          Detect barriers using AI vision technology.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <Upload className="text-cyan-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Upload Street Images</h3>
            <p className="text-zinc-400 mt-2">
              Citizens upload sidewalks, crossings and ramps.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <ShieldAlert className="text-red-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">AI Barrier Detection</h3>
            <p className="text-zinc-400 mt-2">
              Gemini Vision identifies dangerous obstacles.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <MapPinned className="text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Smart Accessibility Mapping</h3>
            <p className="text-zinc-400 mt-2">
              Build a live accessibility map for the city.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
          <h2 className="text-3xl font-bold mb-8">Analyze Accessibility</h2>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-white/20 hover:border-cyan-500/50"
            }`}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <Upload className="mx-auto mb-3 text-cyan-400" size={32} />
            <p className="text-zinc-400">
              Drag & drop image here or{" "}
              <span className="text-cyan-400 underline">click to upload</span>
            </p>
          </div>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />

          {image && (
            <div className="relative inline-block">
              <img
                src={image}
                className="rounded-3xl w-full max-w-xl border border-white/10"
              />
              <button
                onClick={() => {
                  setImage(null);
                  setResult("");
                }}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
              >
                ×
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-8 text-cyan-400 animate-pulse">
              AI analyzing accessibility barriers...
            </div>
          )}

          {result && (
            <pre className="mt-8 bg-black/40 border border-cyan-500/20 p-6 rounded-3xl overflow-auto text-green-300">
              {result}
            </pre>
          )}
        </div>
      </section>
    </main>
  );
}
