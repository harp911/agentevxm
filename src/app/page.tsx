"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[] | null>(null);
  const [hotels, setHotels] = useState<any[] | null>(null);
  const [scrapeMeta, setScrapeMeta] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFlights(null);
    setHotels(null);
    setSelectedFlight(null);
    setSelectedHotel(null);

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
      
      setFlights(json.flights);
      setHotels(json.hotels);
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

  const totalPaquetePP = selectedFlight && selectedHotel ? selectedFlight.precioVueloPP + Math.round(selectedHotel.costoHotelTotal / searchParams.personas) : 0;
  const totalPaqueteGeneral = totalPaquetePP * (searchParams?.personas || 1);

  const generateWhatsApp = () => {
    if (!selectedFlight || !selectedHotel) return;
    
    let text = `*Cotización de Viaje a ${searchParams.destino.toUpperCase()}* ✈️🏨\n\n`;
    text += `*Fechas:* ${selectedFlight.dateOut} al ${selectedFlight.dateRet}\n`;
    text += `*Pasajeros:* ${searchParams.personas}\n`;
    text += `*Duración:* ${searchParams.diasViaje} noches\n\n`;
    
    text += `*VUELO INCLUIDO* 🛫\n`;
    text += `Aerolínea: ${selectedFlight.aerolinea} (${selectedFlight.numeroVuelo})\n`;
    text += `Horarios: ${selectedFlight.horaSalida} - ${selectedFlight.horaLlegada}\n`;
    text += `Escalas: ${selectedFlight.escalas}\n\n`;
    
    text += `*HOTEL INCLUIDO* 🏨\n`;
    text += `Nombre: ${selectedHotel.nombre} (${selectedHotel.estrellas}★)\n`;
    text += `Régimen: ${selectedHotel.regimen}\n\n`;
    
    text += `*INVERSIÓN DEL PAQUETE*\n`;
    text += `Por persona: *${formatCurrency(totalPaquetePP)}*\n`;
    text += `Total paquete: *${formatCurrency(totalPaqueteGeneral)}*\n\n`;
    
    text += `¿Te gustaría proceder con la reserva de esta opción?\n\n`;
    text += `Atentamente,\n*${searchParams.nombreAsesor || 'Asesor VXM'}*\n📞 ${searchParams.telefonoAsesor || ''}\n✉️ ${searchParams.correoAsesor || ''}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto de WhatsApp copiado al portapapeles.');
    });
  };

  const generateEmail = () => {
    if (!selectedFlight || !selectedHotel) return;
    
    const subject = encodeURIComponent(`Propuesta de Viaje a ${searchParams.destino} - Viajando X el Mundo`);
    
    let body = `Hola,\n\nTe comparto esta excelente opción de viaje a ${searchParams.destino}.\n\n`;
    body += `✈️ VUELOS\n- Aerolínea: ${selectedFlight.aerolinea}\n- Ida y Regreso: ${selectedFlight.dateOut} al ${selectedFlight.dateRet}\n- Escalas: ${selectedFlight.escalas}\n\n`;
    body += `🏨 HOTEL\n- Nombre: ${selectedHotel.nombre} (${selectedHotel.estrellas}★)\n- Ubicación: ${selectedHotel.zona}\n- Alimentación: ${selectedHotel.regimen}\n\n`;
    body += `💰 RESUMEN DE PRECIOS\n- Pasajeros: ${searchParams.personas}\n- Precio por persona: ${formatCurrency(totalPaquetePP)}\n- Precio Total: ${formatCurrency(totalPaqueteGeneral)}\n\n`;
    body += `Quedo a tu disposición para cualquier consulta.\n\nSaludos cordiales,\n${searchParams.nombreAsesor || 'Asesor VXM'}\nTel: ${searchParams.telefonoAsesor || ''}\nCorreo: ${searchParams.correoAsesor || ''}`;
    
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 pb-48">
      <header className="bg-white p-6 rounded-xl shadow border mb-6 text-center max-w-7xl mx-auto flex items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-blue-900">✈️ VXM Travel Agent Pro</h1>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow border mb-6">
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
                {loading ? "Buscando en vivo..." : "Buscar Paquetes"}
              </button>
            </div>
          </form>
        </div>

        {scrapeMeta && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-6 text-sm flex items-center gap-2 font-semibold">
            <span>✔️</span> Resultados verificados y extraídos de Google Hotels/Flights el {scrapeMeta.timestamp}
          </div>
        )}

        {flights && hotels && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: VUELOS */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-blue-900 border-b-2 border-blue-100 pb-2 mb-4 flex items-center gap-2">
                ✈️ Vuelos ({flights.length})
              </h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {flights.map((f, i) => {
                  const googleFlightsUrl = `https://www.google.com/travel/flights?q=vuelos+${searchParams.origen}+a+${searchParams.destino}&dates=${f.dateOut},${f.dateRet}`;
                  
                  return (
                    <label key={i} className={`block border p-4 rounded-lg cursor-pointer transition-colors ${selectedFlight?.id === f.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="flight" checked={selectedFlight?.id === f.id} onChange={() => setSelectedFlight(f)} className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-lg">#{i+1} {f.aerolinea}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-blue-600">{formatCurrency(f.precioVueloPP)} <span className="text-xs font-normal text-gray-500">p.p.</span></div>
                          <div className="text-xs text-gray-400">Total: {formatCurrency(f.precioVueloTotal)}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1 text-gray-700">
                        <div><strong>Ida:</strong> {searchParams.origen} → {searchParams.destino} | {f.dateOut} | {f.horaSalida} - {f.horaLlegada} ({f.duracion})</div>
                        <div><strong>Regreso:</strong> {searchParams.destino} → {searchParams.origen} | {f.dateRet} | {f.horaSalida} - {f.horaLlegada} ({f.duracion})</div>
                        <div className="pt-1"><strong>Duración:</strong> {searchParams.diasViaje} noches en destino</div>
                        <div className="text-xs text-gray-500">Escalas: {f.escalas} | Eq: {f.equipajeIncluido ? "Sí" : "No"} | {f.clase}</div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-xs flex justify-between items-center text-blue-600">
                        <a href={googleFlightsUrl} target="_blank" className="hover:underline">Ver Google Flights ↗</a>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA DERECHA: HOTELES */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold text-green-700 border-b-2 border-green-100 pb-2 mb-4 flex items-center gap-2">
                🏨 Alojamiento ({hotels.length})
              </h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {hotels.map((h, i) => {
                  return (
                    <label key={i} className={`block border p-4 rounded-lg cursor-pointer transition-colors ${selectedHotel?.id === h.id ? 'border-green-500 bg-green-50 shadow-md ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <input type="radio" name="hotel" checked={selectedHotel?.id === h.id} onChange={() => setSelectedHotel(h)} className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-lg">#{i+1} {h.nombre}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-green-700">{formatCurrency(h.costoHotelTotal)} <span className="text-xs font-normal text-gray-500">total</span></div>
                          <div className="text-xs text-gray-400">{formatCurrency(h.precioPorNoche)} / noche</div>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1 text-gray-700 pl-8">
                        {h.isLowQuality && <div className="text-amber-600 font-bold text-xs mb-1">⚠️ Rating bajo o sin categoría</div>}
                        {h.incoherente && <div className="text-red-500 font-bold text-xs mb-1">⚠️ Nombre posiblemente incoherente</div>}
                        
                        <div>⭐ {h.estrellas} Estrellas | 🏅 {h.rating}/10</div>
                        <div>📍 Zona {h.zona}</div>
                        <div>🍽️ {h.regimen}</div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-xs flex justify-between items-center text-blue-600 pl-8">
                        <a href={`https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${searchParams.destino}`} target="_blank" className="hover:underline">Ver Hotel ↗</a>
                        {selectedFlight && (
                          <a href={`https://www.booking.com/searchresults.html?ss=${searchParams.destino}&checkin=${selectedFlight.dateOut}&checkout=${selectedFlight.dateRet}&group_adults=${searchParams.personas}`} target="_blank" className="hover:underline text-green-600 font-bold">Verificar Booking ↗</a>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* BARRA FLOTANTE */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {(!selectedFlight || !selectedHotel) ? (
            <div className="w-full text-center py-2 flex flex-col gap-1">
              <div className="font-bold text-lg flex items-center justify-center gap-2">
                <span>🛒</span> Resumen del Paquete Armado
              </div>
              <div className="text-blue-300 text-sm">
                Por favor, selecciona UN Vuelo y UN Hotel de las columnas superiores para calcular el paquete.
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-1 text-sm text-blue-100">
                <p>✈️ <strong>{selectedFlight.aerolinea}</strong> · {selectedFlight.dateOut} al {selectedFlight.dateRet}</p>
                <p>🏨 <strong>{selectedHotel.nombre}</strong> · {searchParams.diasViaje} Noches ({selectedHotel.estrellas}★)</p>
              </div>
              
              <div className="bg-white text-gray-900 p-3 rounded-lg flex gap-6 items-center shadow-inner">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Paquete p.p.</p>
                  <p className="text-2xl font-black text-blue-600">{formatCurrency(totalPaquetePP)}</p>
                </div>
                <div className="border-l pl-6">
                  <p className="text-xs text-gray-500 font-bold uppercase">Total General</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPaqueteGeneral)}</p>
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
  );
}
