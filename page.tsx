"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  ShieldAlert,
  MapPinned,
  Brain,
  MapPin,
  Share2,
  History,
  X,
  Mail,
  BarChart3,
} from "lucide-react";

interface ScanRecord {
  id: number;
  image: string;
  result: string;
  location: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
  dangerLevel: string;
}

function getDangerLevel(result: string): string {
  const r = result.toUpperCase();
  if (r.includes("ALTO")) return "ALTO";
  if (r.includes("MEDIO")) return "MEDIO";
  if (r.includes("BAJO")) return "BAJO";
  return "DESCONOCIDO";
}

function getDangerColor(level: string) {
  if (level === "ALTO") return "border-red-500/50 bg-red-500/10 text-red-300";
  if (level === "MEDIO") return "border-yellow-500/50 bg-yellow-500/10 text-yellow-300";
  if (level === "BAJO") return "border-green-500/50 bg-green-500/10 text-green-300";
  return "border-cyan-500/20 bg-black/40 text-green-300";
}

function getDangerBadge(level: string) {
  if (level === "ALTO") return "bg-red-500 text-white";
  if (level === "MEDIO") return "bg-yellow-500 text-black";
  if (level === "BAJO") return "bg-green-500 text-black";
  return "bg-zinc-500 text-white";
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [shared, setShared] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [dangerLevel, setDangerLevel] = useState("");

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("barriereye-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("barriereye-history", JSON.stringify(history));
  }, [history]);

  // Load Leaflet map
  useEffect(() => {
    if (showMap && history.filter(r => r.lat).length > 0) {
      setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;
        const mapEl = document.getElementById("barrier-map");
        if (!mapEl || (mapEl as any)._leaflet_id) return;
        const map = L.map("barrier-map").setView([32.5149, -117.0382], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        history.filter(r => r.lat).forEach(r => {
          const color = r.dangerLevel === "ALTO" ? "red" : r.dangerLevel === "MEDIO" ? "orange" : "green";
          L.circleMarker([r.lat, r.lng], { color, radius: 10 })
            .addTo(map)
            .bindPopup(`<b>${r.dangerLevel}</b><br/>${r.timestamp}<br/>${r.location}`);
        });
      }, 300);
    }
  }, [showMap, history]);

  const getLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setLocation(coords);
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLoadingLocation(false);
      },
      () => {
        setLocation("Ubicación no disponible");
        setLoadingLocation(false);
      }
    );
  };

  const analyzeImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setImage(reader.result as string);
      setResult("");
      setShared(false);
      setEmailSent(false);
      setDangerLevel("");
      setLoading(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      const level = getDangerLevel(data.result);
      setResult(data.result);
      setDangerLevel(level);
      setLoading(false);

      const record: ScanRecord = {
        id: Date.now(),
        image: reader.result as string,
        result: data.result,
        location: location || "Sin ubicación",
        lat,
        lng,
        timestamp: new Date().toLocaleString("es-MX"),
        dangerLevel: level,
      };
      setHistory((prev) => [record, ...prev]);
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
  }, [location, lat, lng]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleShare = () => {
    const text = `🚨 Barrera detectada por BarrierEye AI\n📍 ${location || "Sin ubicación"}\n⚠️ Nivel: ${dangerLevel}\n\n${result}\n\n#BarrierEyeAI #Accesibilidad #Tijuana`;
    if (navigator.share) {
      navigator.share({ title: "BarrierEye AI", text });
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Reporte de Barrera - BarrierEye AI");
    const body = encodeURIComponent(`Estimadas autoridades,\n\nSe ha detectado una barrera de accesibilidad:\n\n📍 Ubicación: ${location || "No especificada"}\n⚠️ Nivel de peligro: ${dangerLevel}\n\n${result}\n\nReportado con BarrierEye AI`);
    window.open(`mailto:autoridades@tijuana.gob.mx?subject=${subject}&body=${body}`);
    setEmailSent(true);
  };

  // Stats
  const stats = {
    total: history.length,
    alto: history.filter(r => r.dangerLevel === "ALTO").length,
    medio: history.filter(r => r.dangerLevel === "MEDIO").length,
    bajo: history.filter(r => r.dangerLevel === "BAJO").length,
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 rounded-full">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Inteligencia de Accesibilidad IA</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowStats(!showStats); setShowHistory(false); setShowMap(false); }}
              className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 rounded-full text-sm hover:border-cyan-500/50 transition-all">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-zinc-300">Estadísticas</span>
            </button>
            <button onClick={() => { setShowMap(!showMap); setShowHistory(false); setShowStats(false); }}
              className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 rounded-full text-sm hover:border-cyan-500/50 transition-all">
              <MapPinned className="w-4 h-4 text-green-400" />
              <span className="text-zinc-300">Mapa</span>
            </button>
            <button onClick={() => { setShowHistory(!showHistory); setShowStats(false); setShowMap(false); }}
              className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 rounded-full text-sm hover:border-cyan-500/50 transition-all">
              <History className="w-4 h-4 text-cyan-400" />
              <span className="text-zinc-300">Historial ({history.length})</span>
            </button>
          </div>
        </div>

        <h1 className="text-6xl font-black leading-tight max-w-4xl">BarrierEye AI</h1>
        <p className="text-zinc-400 text-xl mt-6 max-w-2xl">
          Análisis de accesibilidad en tiempo real para ciudades más seguras.
          Detecta barreras con tecnología de visión IA.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <Upload className="text-cyan-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Sube Imágenes de Calles</h3>
            <p className="text-zinc-400 mt-2">Ciudadanos suben banquetas, cruces y rampas.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <ShieldAlert className="text-red-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Detección de Barreras con IA</h3>
            <p className="text-zinc-400 mt-2">GPT-4o Vision identifica obstáculos peligrosos.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <MapPinned className="text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Mapeo Inteligente de Accesibilidad</h3>
            <p className="text-zinc-400 mt-2">Construye un mapa de accesibilidad en vivo para la ciudad.</p>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-cyan-400" size={24} />
              Estadísticas de Escaneos
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-black/40 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-white">{stats.total}</p>
                <p className="text-zinc-400 text-sm mt-1">Total</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-red-400">{stats.alto}</p>
                <p className="text-red-400 text-sm mt-1">ALTO</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-yellow-400">{stats.medio}</p>
                <p className="text-yellow-400 text-sm mt-1">MEDIO</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-green-400">{stats.bajo}</p>
                <p className="text-green-400 text-sm mt-1">BAJO</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Panel */}
        {showMap && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPinned className="text-green-400" size={24} />
              Mapa de Barreras Reportadas
            </h2>
            {history.filter(r => r.lat).length === 0 ? (
              <p className="text-zinc-400">Obtén tu ubicación GPS antes de escanear para ver barreras en el mapa.</p>
            ) : (
              <div id="barrier-map" className="w-full h-80 rounded-2xl" />
            )}
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <History className="text-cyan-400" size={24} />
              Historial de Escaneos
            </h2>
            {history.length === 0 ? (
              <p className="text-zinc-400">No hay escaneos aún.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {history.map((record) => (
                  <div key={record.id} onClick={() => setSelectedRecord(record)}
                    className="bg-black/40 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-cyan-500/50 transition-all">
                    <img src={record.image} className="rounded-xl w-full h-32 object-cover mb-3" />
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${getDangerBadge(record.dangerLevel)}`}>
                      {record.dangerLevel}
                    </span>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-2">
                      <MapPin size={10} /> {record.location}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{record.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Detalle del Escaneo</h3>
                <button onClick={() => setSelectedRecord(null)}>
                  <X className="text-zinc-400 hover:text-white" size={24} />
                </button>
              </div>
              <img src={selectedRecord.image} className="rounded-2xl w-full mb-4" />
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${getDangerBadge(selectedRecord.dangerLevel)}`}>
                {selectedRecord.dangerLevel}
              </span>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-3 mb-1">
                <MapPin size={10} /> {selectedRecord.location}
              </p>
              <p className="text-xs text-zinc-500 mb-4">{selectedRecord.timestamp}</p>
              <div className={`border p-4 rounded-2xl whitespace-pre-wrap text-sm ${getDangerColor(selectedRecord.dangerLevel)}`}>
                {selectedRecord.result.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>
          </div>
        )}

        {/* Analyzer */}
        <div className="mt-20 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
          <h2 className="text-3xl font-bold mb-8">Analizar Accesibilidad</h2>

          {/* Location */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button onClick={getLocation}
              className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full text-cyan-300 text-sm hover:bg-cyan-500/20 transition-all">
              <MapPin size={16} />
              {loadingLocation ? "Obteniendo ubicación..." : "Obtener mi ubicación"}
            </button>
            {location && <span className="text-zinc-400 text-sm">📍 {location}</span>}
          </div>

          {/* Drop Zone */}
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all cursor-pointer ${
              dragOver ? "border-cyan-400 bg-cyan-500/10" : "border-white/20 hover:border-cyan-500/50"
            }`}
            onClick={() => document.getElementById("fileInput")?.click()}>
            <Upload className="mx-auto mb-3 text-cyan-400" size={32} />
            <p className="text-zinc-400">
              Arrastra una imagen aquí o{" "}
              <span className="text-cyan-400 underline">haz clic para subir</span>
            </p>
          </div>

          <input id="fileInput" type="file" accept="image/*" onChange={uploadImage} className="hidden" />

          {image && (
            <div className="relative inline-block">
              <img src={image} className="rounded-3xl w-full max-w-xl border border-white/10" />
              <button onClick={() => { setImage(null); setResult(""); setDangerLevel(""); }}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold">
                ×
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-8 text-cyan-400 animate-pulse">
              IA analizando barreras de accesibilidad...
            </div>
          )}

          {result && (
            <>
              {dangerLevel && (
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-zinc-400">Nivel de peligro:</span>
                  <span className={`px-4 py-1 rounded-full font-black text-lg ${getDangerBadge(dangerLevel)}`}>
                    {dangerLevel}
                  </span>
                </div>
              )}
              <div className={`mt-4 border p-6 rounded-3xl whitespace-pre-wrap ${getDangerColor(dangerLevel)}`}>
                {result.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                <button onClick={handleShare}
                  className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-6 py-3 rounded-full text-cyan-300 hover:bg-cyan-500/20 transition-all">
                  <Share2 size={18} />
                  {shared ? "¡Copiado!" : "Compartir reporte"}
                </button>
                <button onClick={handleEmail}
                  className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-6 py-3 rounded-full text-purple-300 hover:bg-purple-500/20 transition-all">
                  <Mail size={18} />
                  {emailSent ? "¡Email abierto!" : "Reportar a autoridades"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
