"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<any[] | null>(null);
  const [scrapeMeta, setScrapeMeta] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  
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
            
            {/* RESUMEN EJECUTIVO AL TOPE DE PANTALLA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-6 rounded-xl shadow-sm text-indigo-900">
              <h2 className="text-2xl font-black mb-4">📊 Resumen Ejecutivo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                <div>
                  <p>🔍 Se analizaron {scrapeMeta.analyzedDates} combinaciones de fechas en el rango.</p>
                  <p>🗓️ Se identificaron las {scrapeMeta.blocksFound} fechas con vuelos más económicos.</p>
                  <p>💸 Rango de vuelos: {formatCurrency(minVuelo)} — {formatCurrency(maxVuelo)} por persona.</p>
                  <p>🏨 Rango de paquetes: {formatCurrency(minPaquete)} — {formatCurrency(maxPaquete)} por persona.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                  <p className="text-lg font-black text-indigo-700 flex items-center gap-2">
                    <span>🏆</span> Mejor balance general:
                  </p>
                  <p className="mt-1">{mejorPaqueteAbsoluto?.hotelNombre} + {mejorPaqueteAbsoluto?.aerolinea}</p>
                  <p className="text-xs text-indigo-500">el {mejorPaqueteAbsoluto?.fechaOut} • {formatCurrency(mejorPaqueteAbsoluto?.precio)} pp</p>
                </div>
              </div>
            </div>

            {/* PRESENTACIÓN EN COLUMNA DE BLOQUES EXACTOS ASCII */}
            <div className="space-y-12">
              {blocks.map((b, bIdx) => {
                const googleFlightsUrl = `https://www.google.com/travel/flights?q=vuelos+${searchParams.origen}+a+${searchParams.destino}&dates=${b.flight.dateOut},${b.flight.dateRet}`;
                const hasVerificacionGoogle = b.flight.urlVerificacion && b.flight.urlVerificacion !== "https://www.google.com/travel/flights";

                return (
                  <div key={bIdx} className="bg-white rounded-xl shadow-lg border-2 border-gray-800 overflow-hidden font-mono text-sm">
                    
                    {/* CABECERA VUELO ASCII */}
                    <div className="bg-gray-100 text-gray-900 p-5 relative border-b-2 border-gray-800">
                      <div className="absolute -top-[1px] left-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-b-md">
                        FECHA ÓPTIMA #{bIdx + 1}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between font-bold">
                          <span>✈ {b.flight.aerolinea} · Sale {b.flight.dateOut} {b.flight.horaSalida} · Llega {b.flight.horaLlegada}</span>
                        </div>
                        <div>
                          <span>Regreso: Sale {b.flight.dateRet} · Llega a destino de origen</span>
                        </div>
                        <div className="text-gray-600">
                          <span>Escalas: {b.flight.escalas} · Equipaje: {b.flight.equipajeIncluido ? "Sí" : "No (o verificar)"} · Clase: {b.flight.clase}</span>
                        </div>
                        <div className="font-bold text-blue-700 pt-2 border-t border-gray-300">
                          <span>Precio vuelo: {formatCurrency(b.flight.precioVueloPP)} p.p. · Total vuelos: {formatCurrency(b.flight.precioVueloTotal)}</span>
                        </div>
                        
                        <div className="pt-2 text-xs space-y-1">
                          <div>🔗 Verificar vuelo ida <span className="mx-2">→</span> <span className="text-red-600">❌ URL no disponible — verificar manualmente en fuente</span></div>
                          <div>🔗 Verificar vuelo regreso <span className="mx-2">→</span> <span className="text-red-600">❌ URL no disponible — verificar manualmente en fuente</span></div>
                          <div>🔗 Ver búsqueda completa <span className="mx-2">→</span> <a href={googleFlightsUrl} target="_blank" className="text-blue-600 hover:underline">Google Flights (Búsqueda Equivalente)</a></div>
                          <div className="pt-2">🕐 Consultado: {scrapeMeta.timestamp} <span className="ml-2 font-bold text-green-600">✅ Verificado ({scrapeMeta.source})</span></div>
                        </div>
                      </div>
                    </div>

                    {/* CUERPO HOTELES ASCII */}
                    <div className="p-5">
                      <p className="font-bold mb-4">Hoteles disponibles para estas fechas:</p>
                      
                      <div className="space-y-4">
                        {b.hotels.map((h: any, hIdx: number) => {
                          const isSelected = selectedPackage?.hotel?.id === h.id;
                          const bookingUrl = `https://www.booking.com/searchresults.html?ss=${searchParams.destino}&checkin=${b.flight.dateOut}&checkout=${b.flight.dateRet}&group_adults=${searchParams.personas}`;
                          const googleHotelUrl = `https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${searchParams.destino}`;

                          return (
                            <div key={hIdx} className={`border border-gray-300 rounded p-4 ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-white hover:bg-gray-50'}`}>
                              <div className="flex flex-col lg:flex-row justify-between gap-4">
                                
                                <div className="space-y-1">
                                  <div className="font-bold text-base flex flex-wrap gap-2 items-center">
                                    {h.etiquetas.map((tag: string, tIdx: number) => (
                                      <span key={tIdx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded border border-yellow-300">
                                        {tag}
                                      </span>
                                    ))}
                                    {h.nombre} 
                                    {h.incoherente && <span className="text-red-500" title="Nombre posiblemente incoherente">⚠️ Verificar nombre</span>}
                                    {h.isLowQuality && <span className="text-amber-500">⚠️ Rating bajo o sin categoría</span>}
                                  </div>
                                  <div className="text-gray-600">
                                    {h.estrellas !== "N/A" ? `★ ${h.estrellas}` : "★ N/A"} · Rating: {h.rating}/10 · {h.zona} · {h.regimen}
                                  </div>
                                  <div className="font-bold">
                                    {formatCurrency(h.precioPorNoche)}/noche · {formatCurrency(h.costoHotelTotal)} total · <span className="text-green-700">Paquete: {formatCurrency(h.costoPaquetePP)} p.p.</span>
                                  </div>
                                  
                                  <div className="pt-2 text-xs space-y-1">
                                    <div>🔗 Ver hotel <span className="mx-2">→</span> <a href={googleHotelUrl} target="_blank" className="text-blue-600 hover:underline">Búsqueda en Google</a></div>
                                    <div>🔗 Verificar disponibilidad <span className="mx-2">→</span> <a href={bookingUrl} target="_blank" className="text-blue-600 hover:underline">Ver en Booking.com (Fechas Exactas)</a></div>
                                  </div>
                                </div>

                                <div className="flex items-end lg:items-center justify-end">
                                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100 font-bold">
                                    <span className="text-green-600">✅</span>
                                    <input 
                                      type="radio" 
                                      name="hotel_selection" 
                                      checked={isSelected}
                                      onChange={() => setSelectedPackage({ flight: b.flight, hotel: h })}
                                      className="w-5 h-5 text-blue-600"
                                    />
                                    Seleccionar este paquete
                                  </label>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* NOTA DE VIGENCIA */}
                      <div className="mt-4 p-3 bg-gray-100 text-xs text-gray-500 text-center border border-gray-200 rounded">
                        ⏱ Precios consultados el {scrapeMeta.timestamp}. Las tarifas aéreas y hoteleras cambian en tiempo real. Verifica los enlaces antes de cotizar al cliente.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECCIÓN FLOTANTE DE COTIZACIÓN */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl border-t-4 border-blue-500 z-50">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-sm">
                
                {!selectedPackage ? (
                  <div className="text-blue-200 animate-pulse text-center w-full">
                    👈 Selecciona [● Seleccionar este paquete] en cualquier bloque.
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-1">
                      <p>Vuelo seleccionado : {selectedPackage.flight.aerolinea} · {selectedPackage.flight.dateOut} al {selectedPackage.flight.dateRet}</p>
                      <p>Hotel seleccionado : {selectedPackage.hotel.nombre} · {selectedPackage.hotel.estrellas}★</p>
                      <p>Score balance      : {Math.round(selectedPackage.hotel.scoreBalance)} {selectedPackage.hotel.etiquetas.join(" ")}</p>
                    </div>
                    
                    <div className="bg-gray-800 text-white p-3 rounded border border-gray-700 flex gap-6 items-center">
                      <div>
                        <p className="text-gray-400">Costo vuelos</p>
                        <p className="font-bold">{formatCurrency(selectedPackage.flight.precioVueloPP)} pp</p>
                      </div>
                      <div className="border-l border-gray-700 pl-4">
                        <p className="text-gray-400">Costo hotel</p>
                        <p className="font-bold">{formatCurrency(selectedPackage.hotel.costoHotelTotal)} total ({searchParams.diasViaje} noches)</p>
                      </div>
                      <div className="border-l border-gray-700 pl-4">
                        <p className="text-gray-400">Costo paquete</p>
                        <p className="font-bold text-green-400">{formatCurrency(selectedPackage.hotel.costoPaquetePP)} pp · {formatCurrency(selectedPackage.hotel.costoPaqueteTotal)} total</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button onClick={generateWhatsApp} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow">
                        Generar WhatsApp
                      </button>
                      <button onClick={generateEmail} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded shadow">
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
