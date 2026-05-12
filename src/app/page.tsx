"use client";

import { useState } from "react";

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(num);
};

function PremiumFechaOptimaBlock({ b, bIdx, searchParams, scrapeMeta, selectedPackage, setSelectedPackage }: any) {
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=vuelos+${searchParams.ciudad_origen}+a+${searchParams.ciudad_destino}&dates=${b.flight.dateOut},${b.flight.dateRet}`;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* SECCIÓN VUELO (CABECERA) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                Opción #{bIdx + 1}
              </span>
              <h3 className="text-xl font-bold tracking-tight">{b.flight.aerolinea} <span className="text-slate-400 font-normal text-sm">({b.flight.numeroVuelo})</span></h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-300">{formatCurrency(b.flight.precioVueloPP)} <span className="text-sm font-normal text-slate-300">COP p.p.</span></div>
              <div className="text-xs text-slate-400 mt-1">Total vuelos: {formatCurrency(b.flight.precioVueloTotal)} COP</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-2">Vuelo de Ida</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{searchParams.ciudad_origen}</span>
                <span className="text-slate-500">→</span>
                <span className="font-bold text-lg">{searchParams.ciudad_destino}</span>
              </div>
              <div className="text-sm text-slate-300">{b.flight.dateOut} | {b.flight.horaSalida} - {b.flight.horaLlegada}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-2">Vuelo de Regreso</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{searchParams.ciudad_destino}</span>
                <span className="text-slate-500">→</span>
                <span className="font-bold text-lg">{searchParams.ciudad_origen}</span>
              </div>
              <div className="text-sm text-slate-300">{b.flight.dateRet} | {b.flight.horaSalida} - {b.flight.horaLlegada}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-300">
            <div className="flex items-center gap-1"><span className="text-slate-500">⏱</span> {searchParams.dias_de_viaje} noches en destino</div>
            <div className="flex items-center gap-1"><span className="text-slate-500">🛫</span> {b.flight.escalas}</div>
            <div className="flex items-center gap-1"><span className="text-slate-500">🧳</span> Eq: {b.flight.equipajeIncluido}</div>
            <div className="flex items-center gap-1"><span className="text-slate-500">💺</span> Clase: {b.flight.clase}</div>
          </div>
        </div>
      </div>

      {/* ENLACES DE VERIFICACIÓN VUELO */}
      <div className="bg-slate-50 px-6 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Verificar ida:</span> <span className="text-rose-500 font-medium">❌ URL no disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Verificar regreso:</span> <span className="text-rose-500 font-medium">❌ URL no disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Búsqueda completa:</span> 
          <a href={googleFlightsUrl} target="_blank" className="text-blue-600 font-bold hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors">
            Abrir URL <span className="text-emerald-500 ml-1">✅</span>
          </a>
        </div>
        <div className="flex items-center gap-2 ml-auto text-slate-400">
          🕐 {scrapeMeta.timestamp}
        </div>
      </div>

      {/* SECCIÓN HOTELES */}
      <div className="p-6">
        <h4 className="text-slate-800 font-bold text-lg mb-6 flex items-center gap-2">
          <span className="text-2xl">🏨</span> Opciones de Alojamiento
          <span className="text-sm font-normal text-slate-500 ml-2">({b.flight.dateOut} al {b.flight.dateRet})</span>
        </h4>
        
        <div className="space-y-4">
          {b.hotels.map((h: any, hIdx: number) => {
            const isSelected = selectedPackage?.hotel?.id === h.id;
            const bookingUrl = `https://www.booking.com/searchresults.html?ss=${searchParams.ciudad_destino}&checkin=${b.flight.dateOut}&checkout=${b.flight.dateRet}&group_adults=${searchParams.cantidad_personas}`;
            const googleHotelUrl = `https://www.google.com/search?q=Hotel+${encodeURIComponent(h.nombre)}+${searchParams.ciudad_destino}`;
            
            const starCount = parseInt(h.estrellas) || 0;

            return (
              <div 
                key={hIdx} 
                className={`relative group p-5 rounded-xl border transition-all duration-300 ${
                  isSelected 
                  ? 'bg-blue-50/50 border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' 
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md cursor-pointer'
                }`}
                onClick={() => setSelectedPackage({ flight: b.flight, hotel: h })}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{h.nombre}</h5>
                      <div className="flex text-amber-400 text-sm">
                        {starCount > 0 ? "★".repeat(starCount) : <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded">Sin estrellas</span>}
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md ml-2">{h.rating}/10</span>
                      
                      {h.etiquetas.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="bg-amber-100/80 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 ml-1">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {h.zona}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
                        {h.regimen}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                      <a href={googleHotelUrl} target="_blank" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
                        Ver hotel en Google <span className="text-amber-500">⚠️</span>
                      </a>
                      <a href={bookingUrl} target="_blank" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors">
                        Disponibilidad Booking <span className="text-amber-500">⚠️</span>
                      </a>
                    </div>

                    {(h.isLowQuality || h.incoherente) && (
                      <div className="mt-3 flex flex-col gap-1">
                        {h.isLowQuality && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold w-fit"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg> Rating bajo o sin categoría</span>}
                        {h.incoherente && <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold w-fit"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg> Nombre posiblemente incoherente</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <div className="text-right w-full">
                      <div className="text-xs text-slate-500 mb-1">Costo hotel: {formatCurrency(h.costoHotelTotal)} total</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paquete Completo</div>
                      <div className="text-2xl font-black text-emerald-600">{formatCurrency(h.costoPaquetePP)} <span className="text-sm font-normal text-emerald-700/70">p.p.</span></div>
                      <div className="text-xs font-medium text-emerald-800 mt-1 bg-emerald-50 px-2 py-1 rounded inline-block">{formatCurrency(h.costoPaqueteTotal)} COP total</div>
                    </div>
                    
                    <div className="mt-4 w-full">
                      <div className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                        isSelected 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white' : 'border-slate-400 group-hover:border-blue-400'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        {isSelected ? 'Paquete Seleccionado' : 'Seleccionar Paquete'}
                      </div>
                    </div>
                  </div>
                </div>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-64 selection:bg-blue-200">
      
      {/* HEADER PREMIUM */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">VXM TRAVEL AGENT</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motor de Optimización Cruzada</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sistema Activo
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        
        {/* FORMULARIO DE NUEVA COTIZACIÓN */}
        <section className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"></div>
          
          <h2 className="font-black text-2xl mb-8 text-slate-800 flex items-center gap-2">
            Configuración del Paquete
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 pb-2">Destinos</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Origen (IATA) *</label>
                    <input name="ciudad_origen" required type="text" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 uppercase transition-all" placeholder="Ej. MDE" maxLength={3} />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Destino (IATA) *</label>
                    <input name="ciudad_destino" required type="text" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 uppercase transition-all" placeholder="Ej. PUJ" maxLength={3} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 pb-2">Fechas y Pasajeros</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Inicio Rango *</label>
                    <input name="fecha_inicio_rango" required type="date" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Fin Rango *</label>
                    <input name="fecha_fin_rango" required type="date" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Noches *</label>
                    <input name="dias_de_viaje" required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all" placeholder="Ej. 4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Pasajeros *</label>
                    <input name="cantidad_personas" required type="number" min="1" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all" defaultValue={2} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 pb-2">Preferencias de Vuelo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Clase</label>
                    <select name="clase_vuelo" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all appearance-none cursor-pointer">
                      <option>Económica</option><option>Ejecutiva</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Aerolínea</label>
                    <input name="aerolinea_preferida" type="text" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all" placeholder="Indiferente" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Escalas</label>
                    <select name="escalas" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all appearance-none cursor-pointer">
                      <option>Sin límite</option><option>Solo directo</option><option>Máx. 1 escala</option><option>Máx. 2 escalas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Equipaje</label>
                    <select name="equipaje_incluido" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all appearance-none cursor-pointer">
                      <option>Indiferente</option><option>Sí</option><option>No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase border-b border-slate-100 pb-2">Alojamiento</h3>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Régimen Alimenticio</label>
                  <select name="regimen_alimenticio" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all appearance-none cursor-pointer">
                    <option>Sin preferencia</option><option>Solo alojamiento</option><option>Desayuno</option><option>Todo incluido</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-slate-100">
              <button 
                disabled={loading} 
                type="submit" 
                className={`bg-slate-900 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all flex items-center gap-3 ${loading ? 'opacity-70 scale-95 cursor-not-allowed' : 'hover:bg-blue-600 hover:shadow-blue-500/30 hover:-translate-y-1'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PROCESANDO COTIZACIÓN...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    INICIAR BÚSQUEDA
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {scrapeMeta && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ZONA A — RESUMEN EJECUTIVO (DASHBOARD) */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-sm font-bold tracking-widest text-blue-300 uppercase mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Resumen Ejecutivo
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Métricas de Análisis</div>
                    <div className="text-3xl font-black">{scrapeMeta.analizadas} <span className="text-sm font-normal text-slate-400">pares evaluados</span></div>
                    <div className="mt-2 text-sm text-blue-200">Se aislaron las {scrapeMeta.optimas} mejores fechas.</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Piso Tarifario (Vuelos)</div>
                    <div className="text-3xl font-black text-white">{formatCurrency(scrapeMeta.minVuelo)} <span className="text-sm font-normal text-slate-400">COP pp</span></div>
                    <div className="mt-2 text-sm text-blue-200">Vuelo más económico hallado.</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Piso Tarifario (Paquetes)</div>
                    <div className="text-3xl font-black text-emerald-400">{formatCurrency(scrapeMeta.minPaquete)} <span className="text-sm font-normal text-emerald-600/70">COP pp</span></div>
                    <div className="mt-2 text-sm text-blue-200">Paquete más económico hallado.</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-amber-950 text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      Ganador Absoluto (Balance Precio/Calidad)
                    </div>
                    <div className="text-xl font-bold text-white">{scrapeMeta.mejorBalance}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Vuelos: SerpApi Google Flights ({scrapeMeta.timestamp})</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Hoteles: SerpApi Google Hotels ({scrapeMeta.timestamp})</div>
                </div>
              </div>
            </section>

            {/* ZONA B — BLOQUES DE FECHA ÓPTIMA */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Opciones de Paquete</h2>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              {blocks && blocks.map((b, bIdx) => (
                <PremiumFechaOptimaBlock 
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
          </div>
        )}
      </div>

      {/* ZONA C — BARRA DE PAQUETE SELECCIONADO (GLASSMORPHISM FOOTER) */}
      {selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700 p-4 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] z-50 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex-1 w-full text-sm">
              <div className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Paquete Seleccionado Listo
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-x-8 gap-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✈️</span>
                  <span className="font-bold text-white">{selectedPackage.flight.aerolinea}</span>
                  <span>({selectedPackage.flight.dateOut} → {selectedPackage.flight.dateRet})</span>
                </div>
                <div className="hidden lg:block w-px h-6 bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏨</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{selectedPackage.hotel.nombre}</span>
                  <span className="text-amber-400 text-xs">{"★".repeat(selectedPackage.hotel.estrellas)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto bg-slate-800 rounded-2xl px-6 py-3 border border-slate-700">
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Precio x Persona</div>
                <div className="text-2xl font-black text-emerald-400 leading-none">{formatCurrency(selectedPackage.hotel.costoPaquetePP)}</div>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total {searchParams.cantidad_personas} Pasajeros</div>
                <div className="text-lg font-bold text-white leading-none">{formatCurrency(selectedPackage.hotel.costoPaqueteTotal)}</div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={generateWhatsApp} className="flex-1 md:flex-none bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.405 0 0 5.405 0 12.031c0 2.123.551 4.195 1.597 6.01L.226 23.364l5.485-1.439a11.968 11.968 0 006.32 1.796h.005c6.626 0 12.032-5.405 12.032-12.031S18.657 0 12.031 0zm0 21.688c-1.79 0-3.542-.481-5.081-1.391l-.364-.216-3.774.99.999-3.681-.237-.377a9.98 9.98 0 01-1.528-5.347c0-5.512 4.488-10 10.005-10 5.517 0 10 4.488 10 10s-4.483 10-10.02 10zM17.513 14.54c-.301-.151-1.782-.88-2.057-.981-.275-.1-.476-.151-.676.151-.2.302-.777.981-.952 1.182-.176.201-.351.226-.652.075-1.954-.974-3.328-2.128-4.103-3.469-.175-.302-.018-.465.132-.616.134-.135.302-.352.452-.528.151-.176.201-.301.302-.502.1-.201.05-.377-.025-.528-.075-.151-.676-1.631-.926-2.234-.241-.58-.485-.502-.676-.512-.175-.01-.376-.01-.577-.01s-.526.075-.802.377c-.275.302-1.053 1.031-1.053 2.513s1.078 2.915 1.228 3.116c.151.201 2.125 3.241 5.143 4.542 2.053.884 2.802.946 3.826.793 1.139-.17 3.513-1.434 4.004-2.819.491-1.385.491-2.571.34-2.819-.15-.248-.551-.399-.852-.55z"/></svg>
                WhatsApp
              </button>
              <button onClick={generateEmail} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Correo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
