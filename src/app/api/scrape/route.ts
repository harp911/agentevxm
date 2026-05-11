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
    const personas = parseInt(data.personas);
    const diasViaje = parseInt(data.diasViaje);
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    
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
    const flightPromises = safePairs.map(p => fetchFlight(data.origen, data.destino, p.out, p.ret, data.personas, data.clase));
    const flightResults = await Promise.all(flightPromises);

    const validFlights = flightResults.filter(f => f.success && f.flight);
    
    const parsedFlights = validFlights.map(f => {
      const flight = f.flight;
      const priceUSD = flight.price || 0;
      const priceCOP = Math.round(priceUSD * USD_TO_COP_RATE);
      const outFlight = flight.flights[0];

      return {
        dateOut: f.dateOut,
        dateRet: f.dateRet,
        precioVueloPP: priceCOP,
        precioVueloTotal: priceCOP * personas,
        aerolinea: outFlight?.airline || "Desconocida",
        numeroVuelo: outFlight?.flight_number || "N/A",
        horaSalida: outFlight?.departure_token?.split(" ")?.[1] || "N/A", 
        horaLlegada: outFlight?.arrival_token?.split(" ")?.[1] || "N/A",
        duracion: flight.total_duration ? Math.floor(flight.total_duration / 60) + "h " + (flight.total_duration % 60) + "m" : "N/A",
        escalas: flight.layovers ? flight.layovers.length > 0 ? flight.layovers.length + " Escala(s)" : "Directo" : "Directo",
        equipajeIncluido: false, 
        clase: data.clase,
        urlVerificacion: f.metadata?.google_flights_url || `https://www.google.com/travel/flights`
      };
    });

    parsedFlights.sort((a, b) => a.precioVueloPP - b.precioVueloPP);
    const top7Flights = parsedFlights.slice(0, 7);

    if (top7Flights.length === 0) {
      throw new Error("No se encontraron vuelos válidos. Verifica los códigos IATA.");
    }

    const hotelPromises = top7Flights.map(f => fetchHotels(data.destino, f.dateOut, f.dateRet, data.personas));
    const hotelResults = await Promise.all(hotelPromises);

    const blocks = [];

    for (let i = 0; i < top7Flights.length; i++) {
      const flight = top7Flights[i];
      const hotelListRaw = hotelResults[i];
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
          const costoPaquetePP = flight.precioVueloPP + Math.round(costoHotelTotal / personas);
          const costoPaqueteTotal = costoPaquetePP * personas;
          const ratingNum = prop.overall_rating ? parseFloat(prop.overall_rating) : 0;
          const isLowQuality = ratingNum > 0 && ratingNum < 6.0 || !prop.extracted_hotel_class;
          
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

          const scoreBalance = (ratingNum / costoPaquetePP) * 1000000;

          hotelesProcesados.push({
            id: `hotel_${flight.dateOut}_${hotelesProcesados.length + 1}`,
            nombre: prop.name,
            estrellas: prop.extracted_hotel_class || "N/A",
            rating: prop.overall_rating || "N/A",
            zona: prop.neighborhood || "Centro",
            regimen: data.regimen !== "Sin preferencia" ? data.regimen : "Solo Alojamiento",
            precioPorNoche: priceNightCOP,
            costoHotelTotal,
            costoPaquetePP,
            costoPaqueteTotal,
            scoreBalance,
            ratingNum,
            isLowQuality,
            incoherente,
            enlace: prop.link || `https://www.google.com/travel/hotels/${data.destino}`,
            etiquetas: []
          });
        }
        if (hotelesProcesados.length >= 10) break;
      }

      if (hotelesProcesados.length > 0) {
        let maxScore = -1;
        let minPrice = Infinity;
        let maxRating = -1;

        hotelesProcesados.forEach(h => {
          if (h.scoreBalance > maxScore) maxScore = h.scoreBalance;
          if (h.costoPaquetePP < minPrice) minPrice = h.costoPaquetePP;
          if (h.ratingNum > maxRating) maxRating = h.ratingNum;
        });

        hotelesProcesados.forEach(h => {
          if (h.scoreBalance === maxScore) h.etiquetas.push("🏆 Mejor balance");
          if (h.costoPaquetePP === minPrice) h.etiquetas.push("💰 Más económico");
          if (h.ratingNum === maxRating && h.ratingNum >= 8.0) h.etiquetas.push("⭐ Mejor hotel");
        });

        hotelesProcesados.sort((a, b) => {
          const aBad = a.isLowQuality || a.incoherente;
          const bBad = b.isLowQuality || b.incoherente;
          if (aBad && !bBad) return 1;
          if (!aBad && bBad) return -1;
          return b.scoreBalance - a.scoreBalance;
        });

        blocks.push({
          flight,
          hotels: hotelesProcesados
        });
      }
    }

    const scrapeMeta = {
      source: "Google Flights & Hotels (SerpApi)",
      timestamp: new Date().toLocaleString("es-CO"),
      analyzedDates: safePairs.length,
      blocksFound: blocks.length
    };

    return NextResponse.json({ success: true, blocks, scrapeMeta });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
