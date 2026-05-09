import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping (SerpApi + Mock Vuelos) para:", data);

    const flights = [];
    const hotels = [];
    
    // 1. Generar 8 opciones de vuelos (Ida y Regreso - Mock temporal)
    for (let i = 1; i <= 8; i++) {
      const precioBaseVuelo = Math.floor(Math.random() * 800000) + 500000;
      const vueloIda = {
        origen: data.origen,
        destino: data.destino,
        fecha: data.fechaInicio,
        horaSalida: `0${Math.floor(Math.random() * 9) + 6}:00 AM`,
        horaLlegada: `${Math.floor(Math.random() * 3) + 10}:30 AM`,
        duracion: "4h 30m"
      };
      const vueloRegreso = {
        origen: data.destino,
        destino: data.origen,
        fecha: data.fechaFin,
        horaSalida: `0${Math.floor(Math.random() * 5) + 2}:00 PM`,
        horaLlegada: `0${Math.floor(Math.random() * 3) + 6}:30 PM`,
        duracion: "4h 30m"
      };

      flights.push({
        id: `flight_${i}`,
        aerolinea: data.aerolinea !== "Cualquiera (Opcional)" && data.aerolinea ? data.aerolinea : (Math.random() > 0.5 ? "Avianca" : "LATAM"),
        numeroVuelo: `AV${Math.floor(Math.random() * 900) + 100}`,
        vueloIda,
        vueloRegreso,
        escalas: data.escalas === "Sin límite" ? "1 Escala (BOG, 2h)" : data.escalas,
        equipajeIncluido: Math.random() > 0.3,
        clase: data.clase,
        precioPorPersona: precioBaseVuelo,
        precioTotal: precioBaseVuelo * parseInt(data.personas)
      });
    }

    // Ordenar Vuelos por precio por persona (menor a mayor)
    flights.sort((a, b) => a.precioPorPersona - b.precioPorPersona);

    // 2. Extraer Hoteles Reales desde SerpApi (Google Hotels)
    const serpApiKey = "946eff8ba05838d9e8d2ff579fb480f7399101c66de6a0f2593308a125e7ffbb";
    const serpApiUrl = new URL("https://serpapi.com/search.json");
    serpApiUrl.searchParams.append("engine", "google_hotels");
    serpApiUrl.searchParams.append("q", data.destino);
    serpApiUrl.searchParams.append("check_in_date", data.fechaInicio);
    serpApiUrl.searchParams.append("check_out_date", data.fechaFin);
    serpApiUrl.searchParams.append("adults", data.personas);
    serpApiUrl.searchParams.append("currency", "COP");
    serpApiUrl.searchParams.append("hl", "es");
    serpApiUrl.searchParams.append("api_key", serpApiKey);

    const serpRes = await fetch(serpApiUrl.toString());
    const serpData = await serpRes.json();

    if (!serpRes.ok || !serpData.properties) {
      throw new Error(`Google Hotels API falló: ${serpData.error || "No se encontraron propiedades"}`);
    }

    const diasViaje = parseInt(data.diasViaje);
    const seenNames = new Set();
    
    for (const prop of serpData.properties) {
      // Regla Anti-Duplicados
      if (seenNames.has(prop.name)) continue;
      
      // Parsear precio (SerpApi puede devolver string "$150.000" o número)
      let precioNoche = 0;
      if (prop.rate_per_night?.lowest) {
         const priceStr = prop.rate_per_night.lowest.replace(/[^0-9]/g, '');
         precioNoche = parseInt(priceStr) || 0;
      }

      // Si el precio es 0, intentar buscar en extracted_lowest_rate
      if (precioNoche === 0 && prop.rate_per_night?.extracted_lowest_rate) {
          precioNoche = prop.rate_per_night.extracted_lowest_rate;
      }
      
      // Solo agregar hoteles con precio válido
      if (precioNoche > 0) {
        seenNames.add(prop.name);
        hotels.push({
          id: `hotel_${hotels.length + 1}`,
          nombre: prop.name,
          estrellas: prop.extracted_hotel_class || "N/A",
          rating: prop.overall_rating || "N/A",
          zona: prop.neighborhood || "Zona Centro",
          regimen: data.regimen !== "Sin preferencia" ? data.regimen : "Desayuno incluido ⚠️",
          precioPorNoche: precioNoche,
          precioTotal: precioNoche * diasViaje,
          enlace: prop.link || `https://www.google.com/travel/hotels/${data.destino}`
        });
      }

      if (hotels.length >= 15) break; // Máximo 15 únicos
    }

    if (hotels.length < 3) {
      throw new Error(`Solo se encontraron ${hotels.length} hoteles únicos. Intenta con otra fecha o destino.`);
    }

    // Ordenar Hoteles por precio total (menor a mayor)
    hotels.sort((a, b) => a.precioTotal - b.precioTotal);

    // Añadir timestamp de verificación para UI (Regla 5)
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
