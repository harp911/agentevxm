"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Error desconocido en el servidor");
      }
      
      setResults(json.packages);
    } catch (error: any) {
      console.error(error);
      alert("Error en el scraping: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-xl shadow-lg mb-8 max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">✈️ VXM Travel Agent</h1>
        <p className="text-blue-100">Automatizador de Cotizaciones - Viajando X el Mundo</p>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b pb-2 mb-6">Parámetros de Búsqueda</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Datos del Viaje */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos del Viaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">1. Origen (IATA o Ciudad)</label>
                  <input name="origen" type="text" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. BOG" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">2. Destino (IATA o Ciudad)</label>
                  <input name="destino" type="text" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. MAD" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">3. Fecha Inicio</label>
                  <input name="fechaInicio" type="date" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">4. Fecha Fin</label>
                  <input name="fechaFin" type="date" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">5. Noches de viaje</label>
                  <input name="diasViaje" type="number" required min="1" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">6. Personas</label>
                  <input name="personas" type="number" required min="1" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Preferencias</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Clase de Vuelo</label>
                  <select name="clase" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Económica</option>
                    <option>Ejecutiva</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Escalas</label>
                  <select name="escalas" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Sin límite</option>
                    <option>Solo directo</option>
                    <option>Máx. 1</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-50">
                {loading ? "Scrapeando en progreso..." : "Generar Opciones Reales"}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        {results && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-blue-600 border-b pb-2 mb-6">Resultados Obtenidos</h2>
            <div className="space-y-4">
              {results.map((pkg: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">Salida: {pkg.fechaSalida}</h4>
                    <p className="text-sm text-gray-600">Vuelo extraído: {pkg.vueloData}</p>
                  </div>
                  <div className="font-bold text-green-600">${pkg.precio}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
