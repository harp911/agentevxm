"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<any[] | null>(null);
  const [scrapeMeta, setScrapeMeta] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  
  // Guardamos un objeto { flight, hotel } seleccionado
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setBlocks(null);
    setSelectedPackage(null);

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
      
      setBlocks(json.blocks);
      setScrapeMeta(json.scrapeMeta);
    } catch (error: any) {
      console.error(error);
      alert("Error del Motor VXM: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
  };

  // Calcular Resumen Ejecutivo
  let minVuelo = Infinity;
  let maxVuelo = -Infinity;
  let minPaquete = Infinity;
  let maxPaquete = -Infinity;
  let mejorPaqueteAbsoluto: any = null;

  if (blocks && blocks.length > 0) {
    blocks.forEach(b => {
      if (b.flight.precioVueloPP < minVuelo) minVuelo = b.flight.precioVueloPP;
      if (b.flight.precioVueloPP > maxVuelo) maxVuelo = b.flight.precioVueloPP;
      
      b.hotels.forEach((h: any) => {
        if (h.costoPaquetePP < minPaquete) minPaquete = h.costoPaquetePP;
        if (h.costoPaquetePP > maxPaquete) maxPaquete = h.costoPaquetePP;
        
        if (!mejorPaqueteAbsoluto || h.scoreBalance > mejorPaqueteAbsoluto.score) {
          mejorPaqueteAbsoluto = {
            hotelNombre: h.nombre,
            aerolinea: b.flight.aerolinea,
            fechaOut: b.flight.dateOut,
            precio: h.costoPaquetePP,
            score: h.scoreBalance
          };
        }
      });
    });
  }

  const generateWhatsApp = () => {
    if (!selectedPackage) return;
    const { flight, hotel } = selectedPackage;
    
    let text = `*Cotización de Viaje a ${searchParams.destino.toUpperCase()}* ✈️🏨\n\n`;
    text += `*Fechas:* ${flight.dateOut} al ${flight.dateRet}\n`;
    text += `*Pasajeros:* ${searchParams.personas}\n`;
    text += `*Duración:* ${searchParams.diasViaje} noches\n\n`;
    
    text += `*VUELO INCLUIDO* 🛫\n`;
    text += `Aerolínea: ${flight.aerolinea} (${flight.numeroVuelo})\n`;
    text += `Horarios: ${flight.horaSalida} - ${flight.horaLlegada}\n`;
    text += `Escalas: ${flight.escalas}\n\n`;
    
    text += `*HOTEL INCLUIDO* 🏨\n`;
    text += `Nombre: ${hotel.nombre} (${hotel.estrellas})\n`;
    text += `Régimen: ${hotel.regimen}\n`;
    if (hotel.etiquetas.length > 0) text += `Categoría VXM: ${hotel.etiquetas.join(" | ")}\n\n`;
    
    text += `*INVERSIÓN DEL PAQUETE*\n`;
    text += `Por persona: *${formatCurrency(hotel.costoPaquetePP)}*\n`;
    text += `Total paquete: *${formatCurrency(hotel.costoPaqueteTotal)}*\n\n`;
    
    text += `¿Te gustaría proceder con la reserva de esta opción?\n\n`;
    text += `Atentamente,\n*${searchParams.nombreAsesor || 'Asesor VXM'}*\n📞 ${searchParams.telefonoAsesor || ''}\n✉️ ${searchParams.correoAsesor || ''}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto de WhatsApp copiado al portapapeles.');
    });
  };

  const generateEmail = () => {
    if (!selectedPackage) return;
    const { flight, hotel } = selectedPackage;
    
    const subject = encodeURIComponent(`Propuesta de Viaje a ${searchParams.destino} - Viajando X el Mundo`);
    
    let body = `Hola,\n\nTe comparto esta excelente opción de viaje a ${searchParams.destino}.\n\n`;
    body += `✈️ VUELOS\n- Aerolínea: ${flight.aerolinea}\n- Ida y Regreso: ${flight.dateOut} al ${flight.dateRet}\n- Escalas: ${flight.escalas}\n\n`;
    body += `🏨 HOTEL\n- Nombre: ${hotel.nombre} (${hotel.estrellas})\n- Ubicación: ${hotel.zona}\n- Alimentación: ${hotel.regimen}\n\n`;
    body += `💰 RESUMEN DE PRECIOS\n- Pasajeros: ${searchParams.personas}\n- Precio por persona: ${formatCurrency(hotel.costoPaquetePP)}\n- Precio Total: ${formatCurrency(hotel.costoPaqueteTotal)}\n\n`;
    body += `Quedo a tu disposición para cualquier consulta.\n\nSaludos cordiales,\n${searchParams.nombreAsesor || 'Asesor VXM'}\nTel: ${searchParams.telefonoAsesor || ''}\nCorreo: ${searchParams.correoAsesor || ''}`;
    
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 pb-48">
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-xl shadow-lg mb-8 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">✈️ VXM Travel Agent Pro</h1>
        <p className="text-blue-100">Motor de Optimización Cruzada (Vuelos + Hoteles)</p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-blue-600 border-b pb-2 mb-6">Parámetros de Búsqueda</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">1. Origen (IATA Obligatorio)</label>
                <input name="origen" type="text" required className="border p-2 rounded uppercase" placeholder="Ej. BOG" maxLength={3} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">2. Destino (IATA Obligatorio)</label>
                <input name="destino" type="text" required className="border p-2 rounded uppercase" placeholder="Ej. MAD" maxLength={3} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">3. Fecha Inicio Rango</label>
                <input name="fechaInicio" type="date" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">4. Fecha Fin Rango</label>
                <input name="fechaFin" type="date" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">5. Noches de viaje en destino</label>
                <input name="diasViaje" type="number" required min="1" className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">6. Cantidad de Personas</label>
                <input name="personas" type="number" required min="1" className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">7. Clase de Vuelo</label>
                <select name="clase" className="border p-2 rounded">
                  <option>Económica</option>
                  <option>Ejecutiva</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">8. Régimen Alimenticio Base</label>
                <select name="regimen" className="border p-2 rounded">
                  <option>Sin preferencia</option>
                  <option>Desayuno incluido</option>
                  <option>Todo incluido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Nombre Asesor</label>
                <input name="nombreAsesor" type="text" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Teléfono</label>
                <input name="telefonoAsesor" type="tel" required className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Correo</label>
                <input name="correoAsesor" type="email" required className="border p-2 rounded" />
              </div>
            </div>

            <div className="text-center pt-4">
              <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-50">
                {loading ? "Analizando y cruzando datos masivos..." : "Ejecutar Motor Cruzado"}
              </button>
            </div>
          </form>
        </div>

        {/* MOTOR CRUZADO - RESULTADOS */}
        {blocks && blocks.length > 0 && scrapeMeta && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Resumen Ejecutivo */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-6 rounded-xl shadow-sm text-indigo-900">
              <h2 className="text-2xl font-black mb-4">📊 Resumen Ejecutivo del Algoritmo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                <div>
                  <p>🔍 Se analizaron <strong>{scrapeMeta.analyzedDates} combinaciones de fechas</strong> en el rango.</p>
                  <p>🗓️ Se aislaron los <strong>{scrapeMeta.blocksFound} bloques de fechas</strong> con los vuelos más económicos.</p>
                  <p>💸 Rango de Vuelos: <strong>{formatCurrency(minVuelo)} — {formatCurrency(maxVuelo)} p.p.</strong></p>
                  <p>🏨 Rango de Paquetes: <strong>{formatCurrency(minPaquete)} — {formatCurrency(maxPaquete)} p.p.</strong></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <p className="text-xs uppercase font-bold text-indigo-400 mb-1">Ganador Absoluto</p>
                  <p className="text-lg font-black text-indigo-700 flex items-center gap-2">
                    <span>🏆</span> Mejor balance general
                  </p>
                  <p className="mt-1">{mejorPaqueteAbsoluto?.hotelNombre} + {mejorPaqueteAbsoluto?.aerolinea}</p>
                  <p className="text-xs text-indigo-500">Salida: {mejorPaqueteAbsoluto?.fechaOut} • {formatCurrency(mejorPaqueteAbsoluto?.precio)} pp</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-indigo-400">✅ Verificado en Google Travel (SerpApi) el {scrapeMeta.timestamp}</p>
            </div>

            {/* Listado de Bloques */}
            <div className="space-y-12">
              {blocks.map((b, bIdx) => (
                <div key={bIdx} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  
                  {/* CABECERA VUELO */}
                  <div className="bg-gray-800 text-white p-6 relative">
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                      FECHA ÓPTIMA #{bIdx + 1}
                    </div>
                    <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-2xl font-black flex items-center gap-2">
                          ✈️ {b.flight.aerolinea} <span className="text-sm font-normal text-gray-400">({b.flight.numeroVuelo})</span>
                        </h3>
                        <p className="text-gray-300 mt-1">
                          <strong>Sale:</strong> {b.flight.dateOut} • <strong>Regresa:</strong> {b.flight.dateRet} ({searchParams.diasViaje} noches)
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {data.origen} → {data.destino} • {b.flight.horaSalida} a {b.flight.horaLlegada} ({b.flight.duracion}) • {b.flight.escalas}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-blue-400">{formatCurrency(b.flight.precioVueloPP)} <span className="text-sm font-normal">p.p.</span></div>
                      </div>
                    </div>

                    {/* ENLACES DE VERIFICACIÓN - VUELOS */}
                    <div className="mt-4 pt-4 border-t border-gray-700 text-xs space-y-1 text-gray-300">
                      <div className="flex items-center gap-2">🔗 Verificar vuelo ida: <span className="text-red-400 font-semibold">❌ URL no disponible — consulta manualmente en Google Flights</span></div>
                      <div className="flex items-center gap-2">🔗 Verificar vuelo regreso: <span className="text-red-400 font-semibold">❌ URL no disponible — consulta manualmente en Google Flights</span></div>
                      <div className="flex items-center gap-2">🔗 Búsqueda completa: <a href={b.flight.urlVerificacion} target="_blank" className="text-blue-400 hover:text-blue-300 underline font-semibold">Abrir búsqueda ↗</a> <span className="text-green-400">✅ Enlace verificado</span></div>
                    </div>
                  </div>

                  {/* CUERPO HOTELES */}
                  <div className="p-0 bg-gray-50">
                    <div className="px-6 py-3 bg-gray-100 border-b text-sm font-bold text-gray-600 uppercase">
                      🏨 Hoteles disponibles en estas fechas exactas
                    </div>
                    <div className="divide-y divide-gray-200">
                      {b.hotels.map((h: any, hIdx: number) => {
                        const isSelected = selectedPackage?.hotel?.id === h.id;
                        return (
                          <label key={hIdx} className={`flex flex-col lg:flex-row items-center gap-6 p-6 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-white'}`}>
                            
                            <div className="flex-none pt-1">
                              <input 
                                type="radio" 
                                name="hotel_selection" 
                                checked={isSelected}
                                onChange={() => setSelectedPackage({ flight: b.flight, hotel: h })}
                                className="w-6 h-6 text-blue-600"
                              />
                            </div>

                            <div className="flex-1 w-full">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-bold text-lg text-gray-900">{h.nombre}</span>
                                {h.etiquetas.map((tag: string, tIdx: number) => (
                                  <span key={tIdx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200 font-bold">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {h.estrellas} ⭐ • Rating: <strong>{h.rating}</strong> • 📍 {h.zona}
                              </p>
                              <p className="text-sm text-gray-500 mb-2">
                                🍽️ {h.regimen}
                              </p>
                              
                              {/* ENLACES DE VERIFICACIÓN - HOTEL */}
                              <div className="text-xs space-y-1 text-gray-500 border-l-2 border-gray-200 pl-2">
                                <div className="flex items-center gap-2">
                                  🔗 Ver hotel: 
                                  <a href={`https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${data.destino}`} target="_blank" className="text-blue-600 hover:underline">Búsqueda Google ↗</a> 
                                  <span className="text-amber-500" title="Enlace genérico aproximado">⚠️ Enlace aproximado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  🔗 Verificar disponibilidad: 
                                  <a href={h.enlace} target="_blank" className="text-blue-600 hover:underline font-semibold">Abrir fechas en Google Travel ↗</a> 
                                  <span className="text-green-600">✅ Enlace verificado</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex-none text-right w-full lg:w-auto bg-white p-3 rounded-lg shadow-sm border">
                              <div className="text-sm text-gray-500 mb-1">Solo Hotel: {formatCurrency(h.precioPorNoche)}/noche ({formatCurrency(h.costoHotelTotal)} total)</div>
                              <div className="text-lg font-black text-green-700 bg-green-50 px-3 py-1 rounded">
                                Paquete: {formatCurrency(h.costoPaquetePP)} <span className="text-xs font-normal">p.p.</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 font-bold">
                                Paquete Total ({searchParams.personas} pax): {formatCurrency(h.costoPaqueteTotal)}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* NOTA DE VIGENCIA */}
                  <div className="bg-gray-100 p-4 text-xs text-gray-500 text-center border-t border-gray-200">
                    ⏱ <strong>Precios consultados el {scrapeMeta.timestamp}.</strong> Las tarifas aéreas y hoteleras cambian en tiempo real. Verifica los enlaces antes de cotizar al cliente.
                  </div>
                </div>
              ))}
            </div>

            {/* SECCIÓN FLOTANTE DE COTIZACIÓN */}
            <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-2xl border-t-4 border-blue-500 z-50 transform transition-transform">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                
                {!selectedPackage ? (
                  <div className="text-blue-200 animate-pulse text-lg font-bold w-full text-center">
                    👈 Selecciona cualquier hotel de los bloques para armar la cotización final.
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-1 text-sm text-blue-100">
                      <p className="flex items-center gap-2"><span className="text-xl">✈️</span> <strong>{selectedPackage.flight.aerolinea}</strong> • {selectedPackage.flight.dateOut} al {selectedPackage.flight.dateRet} ({formatCurrency(selectedPackage.flight.precioVueloPP)} pp)</p>
                      <p className="flex items-center gap-2"><span className="text-xl">🏨</span> <strong>{selectedPackage.hotel.nombre}</strong> • {searchParams.diasViaje} Noches ({formatCurrency(selectedPackage.hotel.costoHotelTotal)} total)</p>
                    </div>
                    
                    <div className="bg-white text-gray-900 p-3 rounded-lg flex gap-6 items-center shadow-inner">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Costo Paquete p.p.</p>
                        <p className="text-2xl font-black text-blue-600">{formatCurrency(selectedPackage.hotel.costoPaquetePP)}</p>
                      </div>
                      <div className="border-l pl-6">
                        <p className="text-xs text-gray-500 font-bold uppercase">Costo Total ({searchParams.personas} pax)</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(selectedPackage.hotel.costoPaqueteTotal)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={generateWhatsApp} className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap shadow-lg">
                        Generar WhatsApp
                      </button>
                      <button onClick={generateEmail} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap shadow-lg">
                        Generar Correo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
