import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping (Mock en Vercel) para:", data);

    const flights = [];
    const hotels = [];
    
    // Simular el tiempo de scraping real
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. Generar 8 opciones de vuelos (Ida y Regreso)
    for (let i = 1; i <= 8; i++) {
      const precioBaseVuelo = Math.floor(Math.random() * 800000) + 500000; // COP 500k a 1.3m pp
      
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

    // 2. Generar 8 opciones de hoteles
    const diasViaje = parseInt(data.diasViaje);
    for (let i = 1; i <= 8; i++) {
      const precioNoche = Math.floor(Math.random() * 400000) + 150000; // COP 150k a 550k
      
      hotels.push({
        id: `hotel_${i}`,
        nombre: `Hotel ${data.destino.toUpperCase()} Resort & Spa ${i}`,
        estrellas: Math.floor(Math.random() * 2) + 3,
        rating: (Math.random() * 2 + 7.5).toFixed(1),
        zona: "Centro Histórico / Zona Hotelera",
        regimen: data.regimen !== "Sin preferencia" ? data.regimen : (Math.random() > 0.5 ? "Desayuno" : "Todo incluido"),
        precioPorNoche: precioNoche,
        precioTotal: precioNoche * diasViaje,
        enlace: `https://booking.com/hotel/${data.destino.toLowerCase()}-${i}`
      });
    }

    // Ordenar Vuelos por precio por persona (menor a mayor)
    flights.sort((a, b) => a.precioPorPersona - b.precioPorPersona);
    // Ordenar Hoteles por precio total (menor a mayor)
    hotels.sort((a, b) => a.precioTotal - b.precioTotal);

    return NextResponse.json({ success: true, flights, hotels });
  } catch (error: any) {
    console.error("Error en scraping:", error);
    return NextResponse.json({ success: false, error: "Fallo el scraping: " + error.message }, { status: 500 });
  }
}
