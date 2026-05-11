"use client";

import { useState } from "react";

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
};

function FechaOptimaBlock({ b, bIdx, searchParams, scrapeMeta, selectedPackage, setSelectedPackage }: any) {
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=vuelos+${searchParams.origen}+a+${searchParams.destino}&dates=${b.flight.dateOut},${b.flight.dateRet}`;

  return (
    <div className="bg-white rounded-lg shadow-xl border-2 border-gray-900 overflow-hidden font-mono text-sm">
      
      {/* SECCIÓN A — VUELO */}
      <div className="bg-gray-100 text-gray-900 p-6 border-b-2 border-gray-900">
        <div className="font-bold text-lg mb-4 text-blue-800">FECHA ÓPTIMA #{bIdx + 1}</div>
        
        <div className="space-y-2">
          <div className="font-bold text-lg">{b.flight.aerolinea} ({b.flight.numeroVuelo})</div>
          <div>IDA:     {searchParams.origen} → {searchParams.destino} | {b.flight.dateOut} | {b.flight.horaSalida} - {b.flight.horaLlegada}</div>
          <div>REGRESO: {searchParams.destino} → {searchParams.origen} | {b.flight.dateRet} | {b.flight.horaSalida} - {b.flight.horaLlegada}</div>
          <div>Duración en destino: {searchParams.diasViaje} noches</div>
          <div>Escalas: {b.flight.escalas} | Equipaje: {b.flight.equipajeIncluido ? "Sí" : "No"} | Clase: {b.flight.clase}</div>
          <div className="font-bold text-blue-700">Precio vuelo: {formatCurrency(b.flight.precioVueloPP)} p.p. | Total vuelos: {formatCurrency(b.flight.precioVueloTotal)} ({searchParams.personas} personas)</div>
        </div>
        
        <hr className="my-4 border-gray-400" />
        
        <div className="space-y-1 text-xs">
          <div className="flex gap-2 items-center">
            🔗 Verificar vuelo ida <span className="ml-2">→</span> <span className="text-red-600">URL no disponible (Verificar manualmente) ❌</span>
          </div>
          <div className="flex gap-2 items-center">
            🔗 Verificar vuelo regreso <span className="ml-2">→</span> <span className="text-red-600">URL no disponible (Verificar manualmente) ❌</span>
          </div>
          <div className="flex gap-2 items-center">
            🔗 Ver búsqueda completa <span className="ml-2">→</span> <a href={googleFlightsUrl} target="_blank" className="text-blue-600 hover:underline">Abrir en Google Flights</a> <span className="text-green-600">✅</span>
          </div>
          <div className="pt-2 text-gray-600">
            🕐 Consultado: {scrapeMeta.timestamp}
          </div>
        </div>
      </div>

      {/* SECCIÓN B — HOTELES */}
      <div className="p-6 bg-white">
        <div className="font-bold text-lg mb-6 border-b pb-2">Hoteles disponibles para esta fecha:</div>
        
        <div className="space-y-6">
          {b.hotels.map((h: any, hIdx: number) => {
            const isSelected = selectedPackage?.hotel?.id === h.id;
            const bookingUrl = `https://www.booking.com/searchresults.html?ss=${searchParams.destino}&checkin=${b.flight.dateOut}&checkout=${b.flight.dateRet}&group_adults=${searchParams.personas}`;
            const googleHotelUrl = `https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${searchParams.destino}`;
            
            const starCount = parseInt(h.estrellas) || 0;
            const starString = starCount > 0 ? "★".repeat(starCount) : "N/A";

            return (
              <div key={hIdx} className={`p-4 rounded-lg border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                
                <div className="font-bold text-lg mb-2">
                  {h.etiquetas.map((tag: string, tIdx: number) => (
                    <span key={tIdx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-300 mr-2">{tag}</span>
                  ))}
                  {h.nombre}
                </div>
                
                <div className="space-y-1 mb-3">
                  <div>Estrellas: [{starString}] | Rating: [{h.rating}]/10 | Zona: {h.zona}</div>
                  <div>Régimen: {h.regimen}</div>
                  <div>Precio: {formatCurrency(h.precioPorNoche)}/noche | Total hotel: {formatCurrency(h.costoHotelTotal)} ({searchParams.diasViaje} noches)</div>
                  <div className="font-bold text-green-700">Paquete: {formatCurrency(h.costoPaquetePP)} p.p. | Total: {formatCurrency(h.costoPaqueteTotal)}</div>
                </div>
                
                <div className="space-y-1 text-xs mb-4">
                  <div className="flex gap-2 items-center">
                    🔗 Ver hotel <span className="ml-2">→</span> <a href={googleHotelUrl} target="_blank" className="text-blue-600 hover:underline">Búsqueda en Google</a> <span className="text-amber-500">⚠️</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    🔗 Verificar disponibilidad <span className="ml-2">→</span> <a href={bookingUrl} target="_blank" className="text-blue-600 hover:underline">Abrir en Booking</a> <span className="text-green-600">✅</span>
                  </div>
                </div>

                {h.isLowQuality && <div className="text-amber-600 font-bold mb-2 text-xs">⚠️ Rating bajo o Sin categoría de estrellas</div>}
                {h.incoherente && <div className="text-red-600 font-bold mb-2 text-xs">⚠️ Nombre incoherente con el destino</div>}

                <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-100 font-bold">
                  <input 
                    type="radio" 
                    name="hotel_selection" 
                    checked={isSelected}
                    onChange={() => setSelectedPackage({ flight: b.flight, hotel: h })}
                    className="w-5 h-5 text-blue-600"
                  />
                  ● Seleccionar este paquete
                </label>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 pb-48">
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-xl shadow-lg mb-8 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">✈️ VXM Travel Agent Pro</h1>
        <p className="text-blue-100">Motor de Optimización Cruzada (Vuelos + Hoteles)</p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Origen (IATA)</label>
              <input name="origen" type="text" required className="border p-2 rounded uppercase" placeholder="BOG" maxLength={3} />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Destino (IATA)</label>
              <input name="destino" type="text" required className="border p-2 rounded uppercase" placeholder="MAD" maxLength={3} />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Fecha Inicio</label>
              <input name="fechaInicio" type="date" required className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Fecha Fin</label>
              <input name="fechaFin" type="date" required className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Días en destino</label>
              <input name="diasViaje" type="number" required min="1" className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Personas</label>
              <input name="personas" type="number" required min="1" className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Clase</label>
              <select name="clase" className="border p-2 rounded"><option>Económica</option><option>Ejecutiva</option></select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Régimen</label>
              <select name="regimen" className="border p-2 rounded"><option>Sin preferencia</option><option>Desayuno incluido</option><option>Todo incluido</option></select>
            </div>
            
            <div className="col-span-full border-t pt-4 grid grid-cols-3 gap-4">
               <input name="nombreAsesor" type="text" required className="border p-2 rounded" placeholder="Tu Nombre" />
               <input name="telefonoAsesor" type="tel" required className="border p-2 rounded" placeholder="Tu Teléfono" />
               <input name="correoAsesor" type="email" required className="border p-2 rounded" placeholder="Tu Correo" />
            </div>

            <div className="col-span-full text-center mt-2">
              <button disabled={loading} type="submit" className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded shadow disabled:opacity-50">
                {loading ? "Buscando en vivo..." : "Buscar Paquetes por Bloques"}
              </button>
            </div>
          </form>
        </div>

        {scrapeMeta && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-6 text-sm flex items-center gap-2 font-semibold">
            <span>✔️</span> Resultados verificados y extraídos de Google Hotels/Flights el {scrapeMeta.timestamp}
          </div>
        )}

        {blocks && blocks.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            
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

            <div className="space-y-12">
              {blocks.map((b, bIdx) => (
                <FechaOptimaBlock 
                  key={bIdx}
                  b={b}
                  bIdx={bIdx}
                  searchParams={searchParams}
                  scrapeMeta={scrapeMeta}
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                />
              ))}
            </div>

          </div>
        )}
      </main>

      {/* SECCIÓN FLOTANTE DE COTIZACIÓN */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-sm">
          
          {!selectedPackage ? (
            <div className="text-blue-200 animate-pulse text-center w-full">
              👈 Selecciona [● Seleccionar este paquete] en cualquier bloque de Fecha Óptima.
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
  );
}
