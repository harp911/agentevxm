import { NextResponse } from "next/server";

const SERP_API_KEY = "946eff8ba05838d9e8d2ff579fb480f7399101c66de6a0f2593308a125e7ffbb";

async function fetchFlight(origen: string, destino: string, outDate: string, retDate: string, adults: string, travelClass: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.append("engine", "google_flights");
  url.searchParams.append("departure_id", origen);
  url.searchParams.append("arrival_id", destino);
  url.searchParams.append("outbound_date", outDate);
  url.searchParams.append("return_date", retDate);
  url.searchParams.append("adults", adults);
  url.searchParams.append("travel_class", travelClass === "Ejecutiva" ? "3" : "1");
  url.searchParams.append("currency", "COP");
  url.searchParams.append("hl", "es");
  url.searchParams.append("type", "1"); // round trip
  url.searchParams.append("api_key", SERP_API_KEY);

  let attempt = 0;
  while (attempt < 2) {
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
      attempt++;
    }
  }
  return { success: false, dateOut: outDate, dateRet: retDate };
}

async function fetchHotels(destino: string, inDate: string, outDate: string, adults: string, regimen: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.append("engine", "google_hotels");
  
  let qStr = `hoteles en ${destino}`;
  if (regimen === "Todo incluido") qStr += " todo incluido";
  url.searchParams.append("q", qStr);
  
  url.searchParams.append("check_in_date", inDate);
  url.searchParams.append("check_out_date", outDate);
  url.searchParams.append("adults", adults);
  url.searchParams.append("currency", "COP"); 
  url.searchParams.append("hl", "es");
  url.searchParams.append("rating", "7"); // mínimo 7/10
  
  if (regimen === "Solo alojamiento") {
    url.searchParams.append("amenities", "free_breakfast=false");
  } else if (regimen === "Desayuno") {
    url.searchParams.append("amenities", "free_breakfast");
  }

  url.searchParams.append("api_key", SERP_API_KEY);

  let attempt = 0;
  while (attempt < 2) {
    try {
      const res = await fetch(url.toString());
      const json = await res.json();
      return json.properties || [];
    } catch (error) {
      attempt++;
    }
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      ciudad_origen, ciudad_destino, fecha_inicio_rango, fecha_fin_rango, 
      dias_de_viaje, cantidad_personas, clase_vuelo, regimen_alimenticio 
    } = data;

    const personas = parseInt(cantidad_personas);
    const diasViaje = parseInt(dias_de_viaje);
    const startDate = new Date(fecha_inicio_rango);
    const endDate = new Date(fecha_fin_rango);
    
    // PASO 1 - Generar y pre-filtrar fechas óptimas
    const datePairs = [];
    let curr = new Date(startDate);
    while (curr <= endDate) {
      const outD = new Date(curr);
      const retD = new Date(curr);
      retD.setDate(retD.getDate() + diasViaje);
      
      const outDay = outD.getUTCDay();
      const retDay = retD.getUTCDay();
      
      let predictiveScore = 0;
      if (outDay === 2 || outDay === 3) predictiveScore += 5; // Martes/Miércoles salida
      if (retDay === 3 || retDay === 4) predictiveScore += 3; // Miércoles/Jueves regreso

      datePairs.push({
        out: outD.toISOString().split("T")[0],
        ret: retD.toISOString().split("T")[0],
        score: predictiveScore
      });
      curr.setDate(curr.getDate() + 1);
    }

    // Ordenar por score predictivo descendente
    datePairs.sort((a, b) => b.score - a.score);
    const safePairs = datePairs.slice(0, 7); 

    // PASO 2 - Paralelizar Vuelos
    const flightPromises = safePairs.map(p => fetchFlight(ciudad_origen, ciudad_destino, p.out, p.ret, cantidad_personas, clase_vuelo));
    const flightResults = await Promise.all(flightPromises);

    const validFlights = flightResults.filter(f => f.success && f.flight);
    
    const parsedFlights = validFlights.map(f => {
      const flight = f.flight;
      const priceCOP = flight.price || 0; // assuming COP
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
        escalas: flight.layovers ? flight.layovers.length > 0 ? flight.layovers.map((l:any)=>l.name).join(", ") : "Vuelo directo" : "Vuelo directo",
        equipajeIncluido: "Verificar manualmente", 
        clase: clase_vuelo,
        urlVerificacion: f.metadata?.google_flights_url || `https://www.google.com/travel/flights`
      };
    });

    // PASO 3 - Ordenar combinaciones por vuelo de menor a mayor
    parsedFlights.sort((a, b) => a.precioVueloPP - b.precioVueloPP);
    const top7Flights = parsedFlights.slice(0, 7);

    if (top7Flights.length === 0) {
      throw new Error("SerpApi no devolvió vuelos para este rango. Verifica los códigos IATA o intenta un rango mayor.");
    }

    // PASO 4 - Paralelizar Hoteles
    const hotelPromises = top7Flights.map(f => fetchHotels(ciudad_destino, f.dateOut, f.dateRet, cantidad_personas, regimen_alimenticio));
    const hotelResults = await Promise.all(hotelPromises);

    const blocks = [];
    let globalMinVuelo = Infinity;
    let globalMaxVuelo = -Infinity;
    let globalMinPaquete = Infinity;
    let globalMaxPaquete = -Infinity;
    let mejorPaqueteAbsoluto: any = null;

    for (let i = 0; i < top7Flights.length; i++) {
      const flight = top7Flights[i];
      const hotelListRaw = hotelResults[i];
      const hotelesProcesados = [];
      const seenNames = new Set();

      globalMinVuelo = Math.min(globalMinVuelo, flight.precioVueloPP);
      globalMaxVuelo = Math.max(globalMaxVuelo, flight.precioVueloPP);

      for (const prop of hotelListRaw) {
        if (seenNames.has(prop.name)) continue;
        
        let priceNightCOP = 0;
        if (prop.rate_per_night?.lowest) {
           const priceStr = prop.rate_per_night.lowest.replace(/[^0-9]/g, '');
           priceNightCOP = parseInt(priceStr) || 0;
        } else if (prop.rate_per_night?.extracted_lowest_rate) {
           priceNightCOP = prop.rate_per_night.extracted_lowest_rate;
        }

        if (priceNightCOP > 0) {
          seenNames.add(prop.name);
          const costoHotelTotal = priceNightCOP * diasViaje;
          const costoPaquetePP = flight.precioVueloPP + Math.round(costoHotelTotal / personas);
          const costoPaqueteTotal = costoPaquetePP * personas;
          
          const ratingNum = prop.overall_rating ? parseFloat(prop.overall_rating) : 0;
          const isLowQuality = ratingNum > 0 && ratingNum < 6.0 || !prop.extracted_hotel_class;
          
          const lowerName = prop.name.toLowerCase();
          const lowerDest = ciudad_destino.toLowerCase();
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
            regimen: regimen_alimenticio !== "Sin preferencia" ? regimen_alimenticio : "Solo Alojamiento",
            precioPorNoche: priceNightCOP,
            costoHotelTotal,
            costoPaquetePP,
            costoPaqueteTotal,
            scoreBalance,
            ratingNum,
            isLowQuality,
            incoherente,
            enlace: prop.link || `https://www.google.com/travel/hotels/${ciudad_destino}`,
            etiquetas: []
          });
        }
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

        // Etiquetado y orden interno
        hotelesProcesados.forEach(h => {
          if (h.scoreBalance === maxScore) h.etiquetas.push("🏆");
          if (h.costoPaquetePP === minPrice) h.etiquetas.push("💰");
          if (h.ratingNum === maxRating && h.ratingNum >= 8.0) h.etiquetas.push("⭐");
          
          globalMinPaquete = Math.min(globalMinPaquete, h.costoPaquetePP);
          globalMaxPaquete = Math.max(globalMaxPaquete, h.costoPaquetePP);
          
          if (!mejorPaqueteAbsoluto || h.scoreBalance > mejorPaqueteAbsoluto.score) {
            mejorPaqueteAbsoluto = {
              hotelNombre: h.nombre,
              aerolinea: flight.aerolinea,
              fechaOut: flight.dateOut,
              score: h.scoreBalance
            };
          }
        });

        hotelesProcesados.sort((a, b) => {
          const aBad = a.isLowQuality || a.incoherente;
          const bBad = b.isLowQuality || b.incoherente;
          if (aBad && !bBad) return 1;
          if (!aBad && bBad) return -1;
          
          if (a.etiquetas.includes("🏆")) return -1;
          if (b.etiquetas.includes("🏆")) return 1;
          if (a.etiquetas.includes("💰")) return -1;
          if (b.etiquetas.includes("💰")) return 1;
          if (a.etiquetas.includes("⭐")) return -1;
          if (b.etiquetas.includes("⭐")) return 1;

          return b.scoreBalance - a.scoreBalance;
        });

        // Mín 5, Máx 10
        const hotelesFinales = hotelesProcesados.slice(0, 10);
        if (hotelesFinales.length >= 5) {
          blocks.push({
            flight,
            hotels: hotelesFinales
          });
        } else {
          // Si no hay 5 hoteles mínimos, aceptamos los que haya (regla de gracia)
          blocks.push({
            flight,
            hotels: hotelesFinales
          });
        }
      }
    }

    // PASO 5 - Resumen Ejecutivo
    const scrapeMeta = {
      timestamp: new Date().toLocaleString("es-CO"),
      analizadas: datePairs.length,
      optimas: blocks.length,
      minVuelo: globalMinVuelo,
      maxVuelo: globalMaxVuelo,
      minPaquete: globalMinPaquete,
      maxPaquete: globalMaxPaquete,
      mejorBalance: mejorPaqueteAbsoluto 
        ? `${mejorPaqueteAbsoluto.hotelNombre} + ${mejorPaqueteAbsoluto.aerolinea} el ${mejorPaqueteAbsoluto.fechaOut}`
        : "N/A"
    };

    return NextResponse.json({ success: true, blocks, scrapeMeta });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
