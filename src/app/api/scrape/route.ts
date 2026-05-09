import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping (Mock en Vercel) para:", data);

    const packages = [];
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    const diasViaje = parseInt(data.diasViaje);
    const personas = parseInt(data.personas);
    
    let currentDate = new Date(startDate);
    
    // Simular el tiempo de scraping real
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let idCounter = 1;

    // 1. Generar combinaciones de fechas dentro del rango
    while (currentDate <= endDate) {
      const returnDate = new Date(currentDate);
      returnDate.setDate(returnDate.getDate() + diasViaje);
      
      const fSalida = currentDate.toISOString().split("T")[0];
      const fRegreso = returnDate.toISOString().split("T")[0];
      
      // 2 & 3. Simular captura de datos
      const vueloIda = {
        aerolinea: data.aerolinea !== "Cualquiera (Opcional)" && data.aerolinea ? data.aerolinea : (Math.random() > 0.5 ? "Avianca" : "LATAM"),
        horarios: "08:00 AM - 12:30 PM",
        duracion: "4h 30m",
        escalas: data.escalas,
        equipaje: "Mochila + Cabina 10kg",
        clase: data.clase,
      };

      const vueloRegreso = {
        aerolinea: vueloIda.aerolinea,
        horarios: "14:00 PM - 18:30 PM",
        duracion: "4h 30m",
        escalas: data.escalas,
        equipaje: "Mochila + Cabina 10kg",
        clase: data.clase,
      };

      const hotel = {
        nombre: `Hotel ${data.destino.toUpperCase()} Premium`,
        estrellas: Math.floor(Math.random() * 2) + 3, // 3 to 4 stars
        rating: (Math.random() * 2 + 7.5).toFixed(1), // 7.5 to 9.5
        zona: "Centro Histórico / Zona Turística",
        regimen: data.regimen,
        precioNoche: Math.floor(Math.random() * 80) + 60, // $60 - $140
      };

      // 4. Construir paquetes y calcular costos
      const costoVuelosPorPersona = Math.floor(Math.random() * 200) + 150; // Ida y vuelta
      const costoHotelTotal = hotel.precioNoche * diasViaje;
      const costoHotelPorPersona = costoHotelTotal / personas;
      
      const costoPaquetePorPersona = Math.round(costoVuelosPorPersona + costoHotelPorPersona);
      const costoPaqueteTotal = Math.round(costoPaquetePorPersona * personas);

      packages.push({
        id: idCounter++,
        fechaSalida: fSalida,
        fechaRegreso: fRegreso,
        vueloIda,
        vueloRegreso,
        hotel,
        costoVuelosPorPersona,
        costoHotelTotal,
        costoPaquetePorPersona,
        costoPaqueteTotal,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Mostrar TODOS los paquetes ordenados de menor a mayor precio por persona.
    packages.sort((a, b) => a.costoPaquetePorPersona - b.costoPaquetePorPersona);

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error("Error en scraping:", error);
    return NextResponse.json({ success: false, error: "Fallo el scraping: " + error.message }, { status: 500 });
  }
}
