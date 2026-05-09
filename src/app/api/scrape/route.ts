import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping (SerpApi + Mock Vuelos Combinados) para:", data);

    const flights = [];
    const hotels = [];
    const personas = parseInt(data.personas);
    const diasViaje = parseInt(data.diasViaje);
    
    // 1. Generar combinaciones de vuelos iterando el rango de fechas
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    let currentDate = new Date(startDate);
    let fIdx = 1;

    while (currentDate <= endDate) {
      const returnDate = new Date(currentDate);
      returnDate.setDate(returnDate.getDate() + diasViaje);
      
      const fSalida = currentDate.toISOString().split("T")[0];
      const fRegreso = returnDate.toISOString().split("T")[0];

      const precioBaseVuelo = Math.floor(Math.random() * 800000) + 500000;
      
      flights.push({
        id: `flight_${fIdx}`,
        aerolinea: data.aerolinea !== "Cualquiera (Opcional)" && data.aerolinea ? data.aerolinea : (Math.random() > 0.5 ? "Avianca" : "LATAM"),
        numeroVuelo: `AV${Math.floor(Math.random() * 900) + 100}`,
        vueloIda: {
          origen: data.origen,
          destino: data.destino,
          fecha: fSalida,
          horaSalida: `0${Math.floor(Math.random() * 9) + 6}:00 AM`,
          horaLlegada: `${Math.floor(Math.random() * 3) + 10}:30 AM`,
          duracion: "4h 30m"
        },
        vueloRegreso: {
          origen: data.destino,
          destino: data.origen,
          fecha: fRegreso,
          horaSalida: `0${Math.floor(Math.random() * 5) + 2}:00 PM`,
          horaLlegada: `0${Math.floor(Math.random() * 3) + 6}:30 PM`,
          duracion: "4h 30m"
        },
        escalas: data.escalas === "Sin límite" ? "1 Escala (BOG, 2h)" : data.escalas,
        equipajeIncluido: Math.random() > 0.3,
        clase: data.clase,
        precioPorPersona: precioBaseVuelo,
        precioTotal: precioBaseVuelo * personas,
        noches: diasViaje
      });
      
      fIdx++;
      currentDate.setDate(currentDate.getDate() + 1);
      if (fIdx > 15) break; // Límite razonable para no saturar la UI si el rango es de meses
    }

    // Ordenar Vuelos por precio por persona (menor a mayor)
    flights.sort((a, b) => a.precioPorPersona - b.precioPorPersona);

    // 2. Extraer Hoteles Reales desde SerpApi (Google Hotels) usando la fecha de inicio
    // check_out_date es fechaInicio + diasViaje
    const serpApiKey = "946eff8ba05838d9e8d2ff579fb480f7399101c66de6a0f2593308a125e7ffbb";
    const serpApiUrl = new URL("https://serpapi.com/search.json");
    
    const serpCheckOut = new Date(startDate);
    serpCheckOut.setDate(serpCheckOut.getDate() + diasViaje);

    serpApiUrl.searchParams.append("engine", "google_hotels");
    serpApiUrl.searchParams.append("q", data.destino);
    serpApiUrl.searchParams.append("check_in_date", data.fechaInicio);
    serpApiUrl.searchParams.append("check_out_date", serpCheckOut.toISOString().split("T")[0]);
    serpApiUrl.searchParams.append("adults", data.personas);
    serpApiUrl.searchParams.append("currency", "COP");
    serpApiUrl.searchParams.append("hl", "es");
    serpApiUrl.searchParams.append("api_key", serpApiKey);

    const serpRes = await fetch(serpApiUrl.toString());
    const serpData = await serpRes.json();

    if (!serpRes.ok || !serpData.properties) {
      throw new Error(`Google Hotels API falló: ${serpData.error || "No se encontraron propiedades"}`);
    }

    const seenNames = new Set();
    
    for (const prop of serpData.properties) {
      if (seenNames.has(prop.name)) continue;
      
      let precioNoche = 0;
      if (prop.rate_per_night?.lowest) {
         const priceStr = prop.rate_per_night.lowest.replace(/[^0-9]/g, '');
         precioNoche = parseInt(priceStr) || 0;
      }

      if (precioNoche === 0 && prop.rate_per_night?.extracted_lowest_rate) {
          precioNoche = prop.rate_per_night.extracted_lowest_rate;
      }
      
      if (precioNoche > 0) {
        seenNames.add(prop.name);
        
        const numericRating = prop.overall_rating ? parseFloat(prop.overall_rating) : 0;
        const hasEstrellas = !!prop.extracted_hotel_class;
        const isLowQuality = numericRating < 6.0 || !hasEstrellas;

        hotels.push({
          id: `hotel_${hotels.length + 1}`,
          nombre: prop.name,
          estrellas: prop.extracted_hotel_class || "N/A",
          rating: prop.overall_rating || "N/A",
          zona: prop.neighborhood || "Zona Centro",
          regimen: data.regimen !== "Sin preferencia" ? data.regimen : "Desayuno incluido",
          precioPorNoche: precioNoche,
          precioTotal: precioNoche * diasViaje,
          enlace: prop.link || `https://www.google.com/travel/hotels/${data.destino}`,
          isLowQuality,
          numericRating
        });
      }

      if (hotels.length >= 15) break; 
    }

    if (hotels.length < 3) {
      throw new Error(`Solo se encontraron ${hotels.length} hoteles únicos. Intenta con otra fecha o destino.`);
    }

    // Ordenar Hoteles: Primero precio (menor a mayor), pero empujar lowQuality al final
    hotels.sort((a, b) => {
      if (a.isLowQuality && !b.isLowQuality) return 1;
      if (!a.isLowQuality && b.isLowQuality) return -1;
      return a.precioTotal - b.precioTotal;
    });

    const scrapeMeta = {
      source: "Google Hotels",
      timestamp: new Date().toLocaleString("es-CO"),
      url: "https://www.google.com/travel/hotels"
    };

    return NextResponse.json({ success: true, flights, hotels, scrapeMeta });
  } catch (error: any) {
    console.error("Error en scraping:", error);
    return NextResponse.json({ success: false, error: "Fallo el scraping: " + error.message }, { status: 500 });
  }
}
