import { NextResponse } from "next/server";

const SERP_API_KEY = "946eff8ba05838d9e8d2ff579fb480f7399101c66de6a0f2593308a125e7ffbb";
const USD_TO_COP_RATE = 4000;

async function fetchFlight(origen: string, destino: string, outDate: string, retDate: string, adults: string, travelClass: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.append("engine", "google_flights");
  url.searchParams.append("departure_id", origen);
  url.searchParams.append("arrival_id", destino);
  url.searchParams.append("outbound_date", outDate);
  url.searchParams.append("return_date", retDate);
  url.searchParams.append("adults", adults);
  url.searchParams.append("travel_class", travelClass === "Ejecutiva" ? "3" : "1");
  url.searchParams.append("currency", "USD");
  url.searchParams.append("hl", "es");
  url.searchParams.append("api_key", SERP_API_KEY);

  try {
    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.best_flights && json.best_flights.length > 0) {
      return { success: true, dateOut: outDate, dateRet: retDate, flight: json.best_flights[0], metadata: json.search_metadata };
    }
    if (json.other_flights && json.other_flights.length > 0) {
      return { success: true, dateOut: outDate, dateRet: retDate, flight: json.other_flights[0], metadata: json.search_metadata };
    }
    return { success: false, dateOut: outDate, dateRet: retDate };
  } catch (error) {
    return { success: false, dateOut: outDate, dateRet: retDate };
  }
}

async function fetchHotels(destino: string, inDate: string, outDate: string, adults: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.append("engine", "google_hotels");
  url.searchParams.append("q", destino);
  url.searchParams.append("check_in_date", inDate);
  url.searchParams.append("check_out_date", outDate);
  url.searchParams.append("adults", adults);
  url.searchParams.append("currency", "USD"); 
  url.searchParams.append("hl", "es");
  url.searchParams.append("api_key", SERP_API_KEY);

  try {
    const res = await fetch(url.toString());
    const json = await res.json();
    return json.properties || [];
  } catch (error) {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando extracción para 2 columnas:", data);

    const personas = parseInt(data.personas);
    const diasViaje = parseInt(data.diasViaje);
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    
    // 1. Generar pares de fechas
    const datePairs = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      const ret = new Date(curr);
      ret.setDate(ret.getDate() + diasViaje);
      datePairs.push({
        out: curr.toISOString().split("T")[0],
        ret: ret.toISOString().split("T")[0]
      });
      curr.setDate(curr.getDate() + 1);
    }

    const safePairs = datePairs.slice(0, 15);

    // PASO 1: Vuelos en Paralelo
    const flightPromises = safePairs.map(p => fetchFlight(data.origen, data.destino, p.out, p.ret, data.personas, data.clase));
    const flightResults = await Promise.all(flightPromises);

    const validFlights = flightResults.filter(f => f.success && f.flight);
    
    const parsedFlights = validFlights.map((f, i) => {
      const flight = f.flight;
      const priceUSD = flight.price || 0;
      const priceCOP = Math.round(priceUSD * USD_TO_COP_RATE);
      const outFlight = flight.flights[0];

      return {
        id: `vuelo_${i}`,
        dateOut: f.dateOut,
        dateRet: f.dateRet,
        precioVueloPP: priceCOP,
        precioVueloTotal: priceCOP * personas,
        aerolinea: outFlight?.airline || "Desconocida",
        numeroVuelo: outFlight?.flight_number || "N/A",
        horaSalida: outFlight?.departure_token?.split(" ")?.[1] || "N/A",
        horaLlegada: outFlight?.arrival_token?.split(" ")?.[1] || "N/A",
        duracion: flight.total_duration ? Math.floor(flight.total_duration / 60) + "h " + (flight.total_duration % 60) + "m" : "N/A",
        escalas: flight.layovers && flight.layovers.length > 0 ? flight.layovers.length + " Escala(s)" : "Directo",
        equipajeIncluido: false,
        clase: data.clase,
        urlVerificacion: f.metadata?.google_flights_url || `https://www.google.com/travel/flights`
      };
    });

    parsedFlights.sort((a, b) => a.precioVueloPP - b.precioVueloPP);
    const topFlights = parsedFlights.slice(0, 15);

    // PASO 2: Hoteles (usando la primera fecha base para referenciar la columna independiente)
    const baseInDate = safePairs[0].out;
    const baseOutDate = safePairs[0].ret;
    
    const hotelListRaw = await fetchHotels(data.destino, baseInDate, baseOutDate, data.personas);
    const hotelesProcesados = [];
    const seenNames = new Set();

    for (const prop of hotelListRaw) {
      if (seenNames.has(prop.name)) continue;
      
      let priceUSD = 0;
      if (prop.rate_per_night?.lowest) {
         const priceStr = prop.rate_per_night.lowest.replace(/[^0-9]/g, '');
         priceUSD = parseInt(priceStr) || 0;
      } else if (prop.rate_per_night?.extracted_lowest_rate) {
          priceUSD = prop.rate_per_night.extracted_lowest_rate;
      }

      if (priceUSD > 0) {
        seenNames.add(prop.name);
        const priceNightCOP = Math.round(priceUSD * USD_TO_COP_RATE);
        const costoHotelTotal = priceNightCOP * diasViaje;
        
        const ratingNum = prop.overall_rating ? parseFloat(prop.overall_rating) : 0;
        const hasEstrellas = !!prop.extracted_hotel_class;
        const isLowQuality = ratingNum > 0 && ratingNum < 6.0 || !hasEstrellas;
        
        const lowerName = prop.name.toLowerCase();
        const lowerDest = data.destino.toLowerCase();
        const commonCities = ["dubai", "paris", "london", "londres", "tokyo", "madrid", "barcelona", "miami", "orlando"];
        let incoherente = false;
        if (!lowerName.includes(lowerDest)) {
          for (const city of commonCities) {
            if (lowerName.includes(city) && lowerDest !== city) {
              incoherente = true;
              break;
            }
          }
        }

        hotelesProcesados.push({
          id: `hotel_${hotelesProcesados.length + 1}`,
          nombre: prop.name,
          estrellas: prop.extracted_hotel_class || "N/A",
          rating: prop.overall_rating || "N/A",
          zona: prop.neighborhood || "Centro",
          regimen: data.regimen !== "Sin preferencia" ? data.regimen : "Solo Alojamiento",
          precioPorNoche: priceNightCOP,
          costoHotelTotal,
          ratingNum,
          isLowQuality,
          incoherente,
          enlace: prop.link || `https://www.google.com/travel/hotels/${data.destino}`,
        });
      }
      if (hotelesProcesados.length >= 15) break;
    }

    // Sort: good ones first
    hotelesProcesados.sort((a, b) => {
      const aBad = a.isLowQuality || a.incoherente;
      const bBad = b.isLowQuality || b.incoherente;
      if (aBad && !bBad) return 1;
      if (!aBad && bBad) return -1;
      return a.precioPorNoche - b.precioPorNoche; // ascending price
    });

    const scrapeMeta = {
      source: "Google Flights & Hotels (SerpApi)",
      timestamp: new Date().toLocaleString("es-CO"),
    };

    return NextResponse.json({ success: true, flights: topFlights, hotels: hotelesProcesados, scrapeMeta });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
