"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setSearchParams(data);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const generateWhatsApp = (pkg: any) => {
    let text = `*Opciones de Viaje a ${searchParams.destino.toUpperCase()}* ✈️🏨\n\n`;
    text += `*Fechas:* ${pkg.fechaSalida} al ${pkg.fechaRegreso}\n`;
    text += `*Pasajeros:* ${searchParams.personas}\n`;
    text += `*Duración:* ${searchParams.diasViaje} noches\n\n`;
    
    text += `*VUELOS* 🛫\n`;
    text += `Ida: ${pkg.vueloIda.aerolinea} (${pkg.vueloIda.horarios})\n`;
    text += `Regreso: ${pkg.vueloRegreso.aerolinea} (${pkg.vueloRegreso.horarios})\n`;
    text += `Escalas: ${pkg.vueloIda.escalas}\n`;
    text += `Equipaje: ${pkg.vueloIda.equipaje}\n\n`;
    
    text += `*HOTEL* 🏨\n`;
    text += `Nombre: ${pkg.hotel.nombre} (${pkg.hotel.estrellas}⭐)\n`;
    text += `Régimen: ${pkg.hotel.regimen}\n\n`;
    
    text += `*INVERSIÓN*\n`;
    text += `Por persona: *$${pkg.costoPaquetePorPersona} COP*\n`;
    text += `Total paquete: *$${pkg.costoPaqueteTotal} COP*\n\n`;
    
    text += `¿Te gustaría proceder con la reserva de esta opción?\n\n`;
    text += `Atentamente,\n*${searchParams.nombreAsesor || 'Asesor VXM'}*\n📞 ${searchParams.telefonoAsesor || ''}\n✉️ ${searchParams.correoAsesor || ''}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto de WhatsApp copiado al portapapeles.');
    });
  };

  const generateEmail = (pkg: any) => {
    const subject = encodeURIComponent(`Propuesta de Viaje a ${searchParams.destino} - Viajando X el Mundo`);
    
    let body = `Hola,\n\nTe comparto esta excelente opción para tu próximo viaje a ${searchParams.destino}.\n\n`;
    body += `✈️ VUELOS\n- Ida: ${pkg.vueloIda.aerolinea} (${pkg.vueloIda.horarios})\n- Regreso: ${pkg.vueloRegreso.aerolinea} (${pkg.vueloRegreso.horarios})\n- Escalas: ${pkg.vueloIda.escalas}\n- Equipaje: ${pkg.vueloIda.equipaje}\n\n`;
    body += `🏨 HOTEL\n- Nombre: ${pkg.hotel.nombre} (${pkg.hotel.estrellas} estrellas)\n- Ubicación: ${pkg.hotel.zona}\n- Alimentación: ${pkg.hotel.regimen}\n\n`;
    body += `💰 RESUMEN DE PRECIOS\n- Fechas: ${pkg.fechaSalida} al ${pkg.fechaRegreso} (${searchParams.diasViaje} noches)\n- Pasajeros: ${searchParams.personas}\n- Precio por persona: $${pkg.costoPaquetePorPersona} COP\n- Precio Total: $${pkg.costoPaqueteTotal} COP\n\n`;
    body += `Quedo a tu disposición para cualquier consulta.\n\nSaludos cordiales,\n${searchParams.nombreAsesor || 'Asesor VXM'}\nTel: ${searchParams.telefonoAsesor || ''}\nCorreo: ${searchParams.correoAsesor || ''}`;
    
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const minPrice = results && results.length > 0 ? results[0].costoPaquetePorPersona : 0;
  const maxPrice = results && results.length > 0 ? results[results.length - 1].costoPaquetePorPersona : 0;

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

            {/* Fuentes de Búsqueda */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Fuentes de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">7. URL Búsqueda Vuelos</label>
                  <input name="urlVuelos" type="url" required defaultValue="https://www.google.com/travel/flights" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">8. URL Búsqueda Hoteles</label>
                  <input name="urlHoteles" type="url" required defaultValue="https://www.booking.com" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Preferencias</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">9. Clase de Vuelo</label>
                  <select name="clase" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Económica</option>
                    <option>Ejecutiva</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">10. Aerolínea Preferida</label>
                  <input name="aerolinea" type="text" placeholder="Cualquiera (Opcional)" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">11. Escalas</label>
                  <select name="escalas" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Sin límite</option>
                    <option>Solo directo</option>
                    <option>Máx. 1</option>
                    <option>Máx. 2</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">12. Régimen Alimenticio</label>
                  <select name="regimen" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Sin preferencia</option>
                    <option>Solo alojamiento</option>
                    <option>Desayuno</option>
                    <option>Todo incluido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Datos del Asesor */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Firma del Asesor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Nombre</label>
                  <input name="nombreAsesor" type="text" required placeholder="Ej. Juan Pérez" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Teléfono</label>
                  <input name="telefonoAsesor" type="tel" required placeholder="Ej. +57 300 000 0000" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-1">Correo</label>
                  <input name="correoAsesor" type="email" required placeholder="asesor@viajandoxelmundo.com" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-50">
                {loading ? "Generando Combinaciones..." : "Generar Opciones Reales"}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        {results && (
          <div className="space-y-6">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg font-semibold flex justify-between items-center border border-blue-100">
              <span>✅ Se encontraron {results.length} paquetes. Rango: ${minPrice} COP - ${maxPrice} COP por persona</span>
              <span className="text-sm font-normal">Sin filtro de presupuesto.</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {results.map((pkg: any) => (
                <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="bg-gray-50 border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold">📅 {pkg.fechaSalida} al {pkg.fechaRegreso}</h3>
                      <p className="text-sm text-gray-500">Para {searchParams.personas} pasajero(s) • {searchParams.diasViaje} noches</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">${pkg.costoPaquetePorPersona} <span className="text-sm font-normal text-gray-600">COP p.p.</span></div>
                      <div className="text-sm text-gray-500 font-medium">Total: ${pkg.costoPaqueteTotal} COP</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">✈️ Vuelos</h4>
                      <p className="text-sm mb-1"><strong>Ida:</strong> {pkg.vueloIda.aerolinea} • {pkg.vueloIda.horarios}</p>
                      <p className="text-xs text-gray-500 mb-3">{pkg.vueloIda.escalas} • {pkg.vueloIda.clase} • Eq: {pkg.vueloIda.equipaje}</p>
                      
                      <p className="text-sm mb-1"><strong>Regreso:</strong> {pkg.vueloRegreso.aerolinea} • {pkg.vueloRegreso.horarios}</p>
                      <p className="text-xs text-gray-500">{pkg.vueloRegreso.escalas} • {pkg.vueloRegreso.clase} • Eq: {pkg.vueloRegreso.equipaje}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">🏨 Alojamiento</h4>
                      <p className="font-bold text-sm mb-1">{pkg.hotel.nombre}</p>
                      <p className="text-xs text-gray-600 mb-1">⭐ {pkg.hotel.estrellas} Estrellas • 🏅 Rating: {pkg.hotel.rating}/10</p>
                      <p className="text-xs text-gray-600 mb-1">📍 {pkg.hotel.zona}</p>
                      <p className="text-xs text-gray-600">🍽️ {pkg.hotel.regimen}</p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="bg-gray-50 border-t p-4 flex gap-3 justify-end">
                    <button onClick={() => generateWhatsApp(pkg)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors shadow-sm">
                      WhatsApp
                    </button>
                    <button onClick={() => generateEmail(pkg)} className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 rounded transition-colors shadow-sm">
                      Correo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
