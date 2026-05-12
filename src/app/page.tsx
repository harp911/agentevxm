"use client";

import { useState } from "react";

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
};

function BloqueFechaOptima({ b, bIdx, searchParams, scrapeMeta, selectedPackage, setSelectedPackage }: any) {
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=vuelos+${searchParams.ciudad_origen}+a+${searchParams.ciudad_destino}&dates=${b.flight.dateOut},${b.flight.dateRet}`;

  return (
    <div className="border border-gray-400 bg-white font-mono text-sm mb-6 shadow-sm">
      <div className="bg-gray-100 p-4 border-b border-gray-400 font-bold uppercase text-gray-800">
        ┌─ FECHA ÓPTIMA #{bIdx + 1} — {b.flight.aerolinea} ─┐
      </div>
      
      <div className="p-4">
        <div className="font-bold text-gray-700 mb-2">SECCIÓN VUELO</div>
        <div className="space-y-1 text-gray-800 mb-4">
          <div>✈ {b.flight.aerolinea} · {b.flight.numeroVuelo}</div>
          <div>IDA:     {searchParams.ciudad_origen}→{searchParams.ciudad_destino} | {b.flight.dateOut} | {b.flight.horaSalida}-{b.flight.horaLlegada}</div>
          <div>REGRESO: {searchParams.ciudad_destino}→{searchParams.ciudad_origen} | {b.flight.dateRet} | {b.flight.horaSalida}-{b.flight.horaLlegada}</div>
          <div>{searchParams.dias_de_viaje} noches en destino</div>
          <div>Escalas: {b.flight.escalas}</div>
          <div>Equipaje: {b.flight.equipajeIncluido} · Clase: {b.flight.clase}</div>
          <div className="font-bold text-blue-800 pt-2">Precio vuelo: {formatCurrency(b.flight.precioVueloPP)} COP p.p. · Total vuelos: {formatCurrency(b.flight.precioVueloTotal)} COP</div>
        </div>
        
        <div className="border-t border-gray-300 my-4"></div>
        
        <div className="space-y-1 text-xs mb-8">
          <div className="flex gap-2 items-center">
            🔗 Verificar vuelo ida <span className="mx-2">→</span> <span className="text-red-600">❌ URL no disponible — verificar manualmente en Google Flights</span>
          </div>
          <div className="flex gap-2 items-center">
            🔗 Verificar vuelo regreso <span className="mx-2">→</span> <span className="text-red-600">❌ URL no disponible — verificar manualmente en Google Flights</span>
          </div>
          <div className="flex gap-2 items-center">
            🔗 Ver búsqueda completa <span className="mx-2">→</span> <a href={googleFlightsUrl} target="_blank" className="text-blue-600 hover:underline">Abrir URL</a> <span className="text-green-600">✅ Verificado</span>
          </div>
          <div className="pt-2 text-gray-500">
            🕐 Consultado: {scrapeMeta.timestamp}
          </div>
        </div>

        <div className="font-bold text-gray-700 mb-2">SECCIÓN HOTELES — disponibles para {b.flight.dateOut}→{b.flight.dateRet}</div>
        
        <div className="space-y-4">
          {b.hotels.map((h: any, hIdx: number) => {
            const isSelected = selectedPackage?.hotel?.id === h.id;
            const bookingUrl = `https://www.booking.com/searchresults.html?ss=${searchParams.ciudad_destino}&checkin=${b.flight.dateOut}&checkout=${b.flight.dateRet}&group_adults=${searchParams.cantidad_personas}`;
            const googleHotelUrl = `https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${searchParams.ciudad_destino}`;
            
            const starCount = parseInt(h.estrellas) || 0;
            const starString = starCount > 0 ? "★".repeat(starCount) : h.estrellas;

            return (
              <div key={hIdx} className={`border border-gray-400 p-3 rounded-sm ${isSelected ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-gray-50'}`}>
                <div className="space-y-1">
                  <div className="font-bold text-base">
                    {h.etiquetas.length > 0 && <span className="mr-2">{h.etiquetas.join("")}</span>}
                    {h.nombre} {starString} | Rating: {h.rating}/10
                  </div>
                  <div className="text-gray-700">Zona: {h.zona} | Régimen: {h.regimen}</div>
                  <div className="text-gray-700">{formatCurrency(h.precioPorNoche)} COP/noche · {formatCurrency(h.costoHotelTotal)} COP total</div>
                  <div className="font-bold text-green-800">PAQUETE: {formatCurrency(h.costoPaquetePP)} COP p.p. · {formatCurrency(h.costoPaqueteTotal)} COP total</div>
                </div>

                <div className="my-3 border-t border-gray-300 border-dashed"></div>

                <div className="space-y-1 text-xs">
                  <div className="flex gap-2 items-center">
                    🔗 Ver hotel <span className="mx-2">→</span> <a href={googleHotelUrl} target="_blank" className="text-blue-600 hover:underline">URL Google</a> <span className="text-amber-600">⚠️ Aproximado</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    🔗 Disponibilidad <span className="mx-2">→</span> <a href={bookingUrl} target="_blank" className="text-blue-600 hover:underline">URL Booking (fechas exactas)</a> <span className="text-amber-600">⚠️ Aproximado</span>
                  </div>
                </div>

                {h.isLowQuality && <div className="mt-2 text-amber-600 font-bold text-xs">⚠️ Rating bajo o sin categoría de estrellas</div>}
                {h.incoherente && <div className="mt-2 text-red-600 font-bold text-xs">⚠️ Nombre incoherente con el destino</div>}

                <div className="mt-4 text-right">
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-400 px-3 py-1 text-xs font-bold hover:bg-gray-100">
                    <input 
                      type="radio" 
                      name="hotel_selection" 
                      checked={isSelected}
                      onChange={() => setSelectedPackage({ flight: b.flight, hotel: h })}
                      className="w-4 h-4 text-blue-600"
                    />
                    ● Seleccionar paquete
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-gray-100 p-2 border-t border-gray-400 text-right text-gray-500">
        └──────────────────────────────────────────────────────────────┘
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

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const startDate = new Date(data.fecha_inicio_rango as string);
    const endDate = new Date(data.fecha_fin_rango as string);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (endDate <= startDate) {
      alert("⚠️ La fecha de fin del rango debe ser mayor a la fecha de inicio.");
      return;
    }
    const diasViaje = parseInt(data.dias_de_viaje as string);
    if (diasViaje >= diffDays) {
      const confirmWarning = confirm("⚠️ Los días de viaje son iguales o mayores a la diferencia de fechas del rango. Esto significa que solo habrá 1 o ninguna combinación posible. ¿Deseas continuar?");
      if (!confirmWarning) return;
    }
    if (parseInt(data.cantidad_personas as string) < 1) {
      alert("⚠️ La cantidad de personas debe ser al menos 1.");
      return;
    }

    setLoading(true);
    setBlocks(null);
    setSelectedPackage(null);
    setSearchParams(data);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Error en el servidor");
      
      setBlocks(json.blocks);
      setScrapeMeta(json.scrapeMeta);
    } catch (error: any) {
      console.error(error);
      alert("Error del Agente VXM: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsApp = () => {
    if (!selectedPackage) return;
    const { flight, hotel } = selectedPackage;
    
    let text = `*Cotización de Viaje a ${searchParams.ciudad_destino.toUpperCase()}* ✈️🏨\n\n`;
    text += `*Fechas:* ${flight.dateOut} al ${flight.dateRet}\n`;
    text += `*Pasajeros:* ${searchParams.cantidad_personas}\n`;
    text += `*Duración:* ${searchParams.dias_de_viaje} noches\n\n`;
    
    text += `*VUELO INCLUIDO* 🛫\n`;
    text += `Aerolínea: ${flight.aerolinea} (${flight.numeroVuelo})\n`;
    text += `Horarios: ${flight.horaSalida} - ${flight.horaLlegada}\n`;
    text += `Escalas: ${flight.escalas}\n\n`;
    
    text += `*HOTEL INCLUIDO* 🏨\n`;
    text += `Nombre: ${hotel.nombre} (${hotel.estrellas})\n`;
    text += `Régimen: ${hotel.regimen}\n\n`;
    
    text += `*INVERSIÓN DEL PAQUETE*\n`;
    text += `Por persona: *${formatCurrency(hotel.costoPaquetePP)} COP*\n`;
    text += `Total paquete: *${formatCurrency(hotel.costoPaqueteTotal)} COP*\n\n`;
    
    text += `¿Te gustaría proceder con la reserva de esta opción?\n\n`;
    text += `Atentamente,\n*Asesor VXM*`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Texto de WhatsApp copiado al portapapeles.');
    });
  };

  const generateEmail = () => {
    if (!selectedPackage) return;
    const { flight, hotel } = selectedPackage;
    const subject = encodeURIComponent(`Cotización de Viaje a ${searchParams.ciudad_destino} - Viajando X el Mundo`);
    let body = `Hola,\n\nTe comparto esta excelente opción de viaje a ${searchParams.ciudad_destino}.\n\n`;
    body += `✈️ VUELOS\n- Aerolínea: ${flight.aerolinea}\n- Ida y Regreso: ${flight.dateOut} al ${flight.dateRet}\n- Escalas: ${flight.escalas}\n\n`;
    body += `🏨 HOTEL\n- Nombre: ${hotel.nombre} (${hotel.estrellas})\n- Ubicación: ${hotel.zona}\n- Alimentación: ${hotel.regimen}\n\n`;
    body += `💰 RESUMEN DE PRECIOS\n- Pasajeros: ${searchParams.cantidad_personas}\n- Precio por persona: ${formatCurrency(hotel.costoPaquetePP)} COP\n- Precio Total: ${formatCurrency(hotel.costoPaqueteTotal)} COP\n\n`;
    body += `Quedo a tu disposición para cualquier consulta.\n\nSaludos cordiales,\nAsesor VXM`;
    window.open(`mailto:?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 pb-64">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b-4 border-blue-900 pb-4">
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">VXM TRAVEL AGENT</h1>
          <p className="text-sm font-bold text-gray-600">MOTOR DE COTIZACIÓN INTERNO — SÓLO PARA USO DE ASESORES</p>
        </header>

        {/* FORMULARIO DE NUEVA COTIZACIÓN */}
        <section className="bg-white p-6 border border-gray-300 shadow-sm font-mono text-sm">
          <div className="font-bold text-lg mb-4 border-b border-gray-300 pb-2">FORMULARIO DE NUEVA COTIZACIÓN</div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <div className="font-bold text-blue-800">─── RUTA ───────────────────────────────────────────────────────────</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>ciudad_origen (*) IATA:</label><input name="ciudad_origen" required type="text" className="w-full border p-1 uppercase" placeholder="MDE" maxLength={3} /></div>
                <div><label>ciudad_destino (*) IATA:</label><input name="ciudad_destino" required type="text" className="w-full border p-1 uppercase" placeholder="PUJ" maxLength={3} /></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-blue-800">─── FECHAS ─────────────────────────────────────────────────────────</div>
              <div className="grid grid-cols-3 gap-4">
                <div><label>fecha_inicio_rango (*):</label><input name="fecha_inicio_rango" required type="date" className="w-full border p-1" /></div>
                <div><label>fecha_fin_rango (*):</label><input name="fecha_fin_rango" required type="date" className="w-full border p-1" /></div>
                <div><label>dias_de_viaje (*):</label><input name="dias_de_viaje" required type="number" min="1" className="w-full border p-1" placeholder="Noches" /></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-blue-800">─── PASAJEROS ──────────────────────────────────────────────────────</div>
              <div><label>cantidad_personas (*):</label><input name="cantidad_personas" required type="number" min="1" className="w-32 border p-1 block" defaultValue={2} /></div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-blue-800">─── VUELO ──────────────────────────────────────────────────────────</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label>clase_vuelo:</label><select name="clase_vuelo" className="w-full border p-1"><option>Económica</option><option>Ejecutiva</option></select></div>
                <div><label>aerolinea_preferida:</label><input name="aerolinea_preferida" type="text" className="w-full border p-1" placeholder="Opcional" /></div>
                <div><label>escalas:</label><select name="escalas" className="w-full border p-1"><option>Sin límite</option><option>Solo directo</option><option>Máx. 1 escala</option><option>Máx. 2 escalas</option></select></div>
                <div><label>equipaje_incluido:</label><select name="equipaje_incluido" className="w-full border p-1"><option>Indiferente</option><option>Sí</option><option>No</option></select></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-blue-800">─── HOTEL ──────────────────────────────────────────────────────────</div>
              <div><label>regimen_alimenticio:</label><select name="regimen_alimenticio" className="w-full border p-1"><option>Sin preferencia</option><option>Solo alojamiento</option><option>Desayuno</option><option>Todo incluido</option></select></div>
            </div>

            <div className="pt-4 text-center">
              <button disabled={loading} type="submit" className="bg-blue-900 text-white font-bold py-2 px-8 uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50">
                {loading ? "EJECUTANDO MOTOR..." : "INICIAR BÚSQUEDA"}
              </button>
            </div>
          </form>
        </section>

        {scrapeMeta && (
          <>
            {/* ZONA A — RESUMEN EJECUTIVO */}
            <section className="bg-yellow-50 border border-yellow-400 p-4 font-mono text-sm shadow-sm text-yellow-900">
              <div className="font-bold mb-2">════════════════════════════════════════════════════════════════</div>
              <div className="font-bold mb-2">ZONA A — RESUMEN EJECUTIVO</div>
              <div className="font-bold mb-2">════════════════════════════════════════════════════════════════</div>
              <div className="space-y-1">
                <div>Se analizaron {scrapeMeta.analizadas} combinaciones de fechas en el rango.</div>
                <div>Fechas óptimas encontradas: {scrapeMeta.optimas} de 7</div>
                <div>Vuelos desde: {formatCurrency(scrapeMeta.minVuelo)} COP p.p.</div>
                <div>Paquetes desde: {formatCurrency(scrapeMeta.minPaquete)} COP p.p.</div>
                <div className="font-bold text-yellow-800 mt-2">🏆 Mejor balance global: {scrapeMeta.mejorBalance}</div>
                <div className="mt-4 text-xs text-yellow-700">✈ Fuente vuelos: SerpApi Google Flights · {scrapeMeta.timestamp}</div>
                <div className="text-xs text-yellow-700">🏨 Fuente hoteles: Google Hotels · {scrapeMeta.timestamp}</div>
              </div>
            </section>

            {/* ZONA B — BLOQUES DE FECHA ÓPTIMA */}
            <section className="font-mono">
              <div className="font-bold mb-2 text-sm text-gray-800">════════════════════════════════════════════════════════════════</div>
              <div className="font-bold mb-2 text-sm text-gray-800">ZONA B — BLOQUES DE FECHA ÓPTIMA</div>
              <div className="font-bold mb-6 text-sm text-gray-800">════════════════════════════════════════════════════════════════</div>
              
              {blocks && blocks.map((b, bIdx) => (
                <BloqueFechaOptima 
                  key={bIdx}
                  b={b}
                  bIdx={bIdx}
                  searchParams={searchParams}
                  scrapeMeta={scrapeMeta}
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                />
              ))}
            </section>
          </>
        )}
      </div>

      {/* ZONA C — BARRA DE PAQUETE SELECCIONADO */}
      {selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-50 font-mono text-sm border-t-4 border-green-500">
          <div className="max-w-4xl mx-auto">
            <div className="font-bold text-gray-400 mb-2 hidden md:block">════════════════════════════════════════════════════════════════</div>
            <div className="font-bold text-green-400 mb-2">ZONA C — PAQUETE SELECCIONADO</div>
            <div className="font-bold text-gray-400 mb-4 hidden md:block">════════════════════════════════════════════════════════════════</div>
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div className="flex-1 space-y-1 w-full">
                <div>✈ {selectedPackage.flight.aerolinea} · Sale {selectedPackage.flight.dateOut} → Regresa {selectedPackage.flight.dateRet}</div>
                <div>🏨 {selectedPackage.hotel.nombre} {selectedPackage.hotel.estrellas > 0 ? "★".repeat(selectedPackage.hotel.estrellas) : selectedPackage.hotel.estrellas} · {selectedPackage.hotel.regimen}</div>
                <div className="flex gap-4 mt-2 text-gray-300">
                  <span>Vuelos: {formatCurrency(selectedPackage.flight.precioVueloPP)} COP p.p.</span>
                  <span>Hotel: {formatCurrency(selectedPackage.hotel.costoHotelTotal)} COP total ({searchParams.dias_de_viaje} noches)</span>
                </div>
                <div className="border-b border-gray-600 my-2"></div>
                <div className="text-lg">
                  <span className="font-bold text-white">TOTAL: {formatCurrency(selectedPackage.hotel.costoPaquetePP)} COP p.p.</span>
                  <span className="text-gray-400 ml-2">· {formatCurrency(selectedPackage.hotel.costoPaqueteTotal)} COP total ({searchParams.cantidad_personas} pax)</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={generateWhatsApp} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-sm whitespace-nowrap">
                  [ 📱 Generar WhatsApp ]
                </button>
                <button onClick={generateEmail} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-sm whitespace-nowrap">
                  [ 📧 Generar correo ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
