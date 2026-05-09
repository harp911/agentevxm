"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[] | null>(null);
  const [hotels, setHotels] = useState<any[] | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFlights(null);
    setHotels(null);
    setSelectedFlightId(null);
    setSelectedHotelId(null);

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
    } catch (error: any) {
      console.error(error);
      alert("Error en el scraping: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedFlight = flights?.find(f => f.id === selectedFlightId);
  const selectedHotel = hotels?.find(h => h.id === selectedHotelId);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
  };

  const generateWhatsApp = () => {
    if (!selectedFlight || !selectedHotel) return;
    
    const personas = parseInt(searchParams.personas);
    const costoPaquetePorPersona = selectedFlight.precioPorPersona + (selectedHotel.precioTotal / personas);
    const costoPaqueteTotal = costoPaquetePorPersona * personas;

    let text = `*Cotización de Viaje a ${searchParams.destino.toUpperCase()}* ✈️🏨\n\n`;
    text += `*Fechas:* ${selectedFlight.vueloIda.fecha} al ${selectedFlight.vueloRegreso.fecha}\n`;
    text += `*Pasajeros:* ${searchParams.personas}\n`;
    text += `*Duración:* ${searchParams.diasViaje} noches\n\n`;
    
    text += `*VUELOS SELECCIONADOS* 🛫\n`;
    text += `Aerolínea: ${selectedFlight.aerolinea} (${selectedFlight.numeroVuelo})\n`;
    text += `Ida: ${selectedFlight.vueloIda.origen} → ${selectedFlight.vueloIda.destino} (${selectedFlight.vueloIda.horaSalida})\n`;
    text += `Regreso: ${selectedFlight.vueloRegreso.origen} → ${selectedFlight.vueloRegreso.destino} (${selectedFlight.vueloRegreso.horaSalida})\n`;
    text += `Escalas: ${selectedFlight.escalas}\n`;
    text += `Equipaje: ${selectedFlight.equipajeIncluido ? 'Sí incluye' : 'No incluye'}\n\n`;
    
    text += `*HOTEL SELECCIONADO* 🏨\n`;
    text += `Nombre: ${selectedHotel.nombre} (${selectedHotel.estrellas}⭐)\n`;
    text += `Régimen: ${selectedHotel.regimen}\n\n`;
    
    text += `*INVERSIÓN DEL PAQUETE*\n`;
    text += `Por persona: *${formatCurrency(costoPaquetePorPersona)}*\n`;
    text += `Total paquete: *${formatCurrency(costoPaqueteTotal)}*\n\n`;
    
    text += `¿Te gustaría proceder con la reserva de esta opción?\n\n`;
    text += `Atentamente,\n*${searchParams.nombreAsesor || 'Asesor VXM'}*\n📞 ${searchParams.telefonoAsesor || ''}\n✉️ ${searchParams.correoAsesor || ''}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto de WhatsApp copiado al portapapeles.');
    });
  };

  const generateEmail = () => {
    if (!selectedFlight || !selectedHotel) return;
    
    const personas = parseInt(searchParams.personas);
    const costoPaquetePorPersona = selectedFlight.precioPorPersona + (selectedHotel.precioTotal / personas);
    const costoPaqueteTotal = costoPaquetePorPersona * personas;

    const subject = encodeURIComponent(`Propuesta de Viaje a ${searchParams.destino} - Viajando X el Mundo`);
    
    let body = `Hola,\n\nTe comparto esta excelente opción para tu próximo viaje a ${searchParams.destino}.\n\n`;
    body += `✈️ VUELOS\n- Aerolínea: ${selectedFlight.aerolinea}\n- Ida: ${selectedFlight.vueloIda.origen} → ${selectedFlight.vueloIda.destino} (${selectedFlight.vueloIda.horaSalida})\n- Regreso: ${selectedFlight.vueloRegreso.origen} → ${selectedFlight.vueloRegreso.destino} (${selectedFlight.vueloRegreso.horaSalida})\n- Equipaje: ${selectedFlight.equipajeIncluido ? 'Sí' : 'No'}\n\n`;
    body += `🏨 HOTEL\n- Nombre: ${selectedHotel.nombre} (${selectedHotel.estrellas} estrellas)\n- Ubicación: ${selectedHotel.zona}\n- Alimentación: ${selectedHotel.regimen}\n\n`;
    body += `💰 RESUMEN DE PRECIOS\n- Fechas: ${selectedFlight.vueloIda.fecha} al ${selectedFlight.vueloRegreso.fecha} (${searchParams.diasViaje} noches)\n- Pasajeros: ${searchParams.personas}\n- Precio por persona: ${formatCurrency(costoPaquetePorPersona)}\n- Precio Total: ${formatCurrency(costoPaqueteTotal)}\n\n`;
    body += `Quedo a tu disposición para cualquier consulta.\n\nSaludos cordiales,\n${searchParams.nombreAsesor || 'Asesor VXM'}\nTel: ${searchParams.telefonoAsesor || ''}\nCorreo: ${searchParams.correoAsesor || ''}`;
    
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-xl shadow-lg mb-8 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">✈️ VXM Travel Agent</h1>
        <p className="text-blue-100">Arma tu paquete: Selecciona un Vuelo y un Hotel</p>
      </header>

      <main className="max-w-7xl mx-auto">
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
                {loading ? "Extrayendo Opciones..." : "Generar Opciones Reales"}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados: Dos Columnas */}
        {flights && hotels && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* COLUMNA VUELOS */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-blue-900 border-b pb-2 mb-4">✈️ Vuelos ({flights.length})</h2>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {flights.map((flight, idx) => (
                    <label key={flight.id} className={`block cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedFlightId === flight.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="flightSelection" 
                            value={flight.id}
                            checked={selectedFlightId === flight.id}
                            onChange={() => setSelectedFlightId(flight.id)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-bold text-lg text-gray-800">#{idx + 1} {flight.aerolinea}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{formatCurrency(flight.precioPorPersona)} <span className="text-xs text-gray-500 font-normal">p.p.</span></div>
                          <div className="text-xs text-gray-500">Total: {formatCurrency(flight.precioTotal)}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 ml-7 space-y-1">
                        <p><strong>Ida:</strong> {flight.vueloIda.origen} → {flight.vueloIda.destino} | {flight.vueloIda.fecha} | {flight.vueloIda.horaSalida} - {flight.vueloIda.horaLlegada} ({flight.vueloIda.duracion})</p>
                        <p><strong>Regreso:</strong> {flight.vueloRegreso.origen} → {flight.vueloRegreso.destino} | {flight.vueloRegreso.fecha} | {flight.vueloRegreso.horaSalida} - {flight.vueloRegreso.horaLlegada} ({flight.vueloRegreso.duracion})</p>
                        <p className="mt-2 text-xs">Escalas: {flight.escalas} | Eq: {flight.equipajeIncluido ? 'Sí' : 'No'} | {flight.clase}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* COLUMNA HOTELES */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-green-700 border-b pb-2 mb-4">🏨 Alojamiento ({hotels.length})</h2>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {hotels.map((hotel, idx) => (
                    <label key={hotel.id} className={`block cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedHotelId === hotel.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="hotelSelection" 
                            value={hotel.id}
                            checked={selectedHotelId === hotel.id}
                            onChange={() => setSelectedHotelId(hotel.id)}
                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                          />
                          <span className="font-bold text-lg text-gray-800">#{idx + 1} {hotel.nombre}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700">{formatCurrency(hotel.precioTotal)} <span className="text-xs text-gray-500 font-normal">total</span></div>
                          <div className="text-xs text-gray-500">{formatCurrency(hotel.precioPorNoche)} / noche</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 ml-7 space-y-1">
                        <p>⭐ {hotel.estrellas} Estrellas | 🏅 {hotel.rating}/10</p>
                        <p>📍 {hotel.zona}</p>
                        <p>🍽️ {hotel.regimen}</p>
                        <a href={hotel.enlace} target="_blank" className="text-blue-500 hover:underline text-xs" onClick={e => e.stopPropagation()}>Ver Hotel ↗</a>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* SECCIÓN DE RESUMEN DINÁMICO */}
            <div className="bg-blue-900 text-white p-6 rounded-xl shadow-xl sticky bottom-4 border-2 border-blue-400">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🛒 Resumen del Paquete Armado</h2>
              
              {!selectedFlight || !selectedHotel ? (
                <div className="text-blue-200 animate-pulse">
                  Por favor, selecciona UN Vuelo y UN Hotel de las columnas superiores para calcular el paquete.
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1 space-y-2 text-sm text-blue-100">
                    <p><strong>✈️ Vuelo:</strong> {selectedFlight.aerolinea} • {selectedFlight.vueloIda.fecha} al {selectedFlight.vueloRegreso.fecha} ({formatCurrency(selectedFlight.precioPorPersona)} pp)</p>
                    <p><strong>🏨 Hotel:</strong> {selectedHotel.nombre} • {searchParams.diasViaje} Noches ({formatCurrency(selectedHotel.precioTotal)} total)</p>
                  </div>
                  
                  <div className="bg-white text-gray-900 p-4 rounded-lg flex gap-8 items-center shadow-inner">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Costo por Persona</p>
                      <p className="text-2xl font-black text-blue-600">
                        {formatCurrency(selectedFlight.precioPorPersona + (selectedHotel.precioTotal / parseInt(searchParams.personas)))}
                      </p>
                    </div>
                    <div className="border-l pl-8">
                      <p className="text-xs text-gray-500 font-bold uppercase">Costo Total ({searchParams.personas} pax)</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatCurrency((selectedFlight.precioPorPersona + (selectedHotel.precioTotal / parseInt(searchParams.personas))) * parseInt(searchParams.personas))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button onClick={generateWhatsApp} className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded transition-colors whitespace-nowrap">
                      Generar WhatsApp
                    </button>
                    <button onClick={generateEmail} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors whitespace-nowrap">
                      Generar Correo
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
