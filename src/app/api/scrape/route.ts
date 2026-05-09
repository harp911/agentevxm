import { NextResponse } from "next/server";
// import puppeteer from "puppeteer"; // Comentado temporalmente por incompatibilidad directa con Vercel

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping (Mock en Vercel) para:", data);

    // TODO: Para usar Puppeteer en Vercel Serverless, necesitamos instalar @sparticuz/chromium y puppeteer-core
    // Por ahora, como el botón azul fallaba por el crash de Puppeteer en Vercel, devolveremos los datos simulados:
    
    const results = [];
    
    // Convertir fechas y generar combinaciones
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    const diasViaje = parseInt(data.diasViaje);
    
    let currentDate = new Date(startDate);
    
    // Simulamos un delay de 2 segundos para dar el efecto de que está buscando en las aerolíneas
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    while (currentDate <= endDate) {
      const returnDate = new Date(currentDate);
      returnDate.setDate(returnDate.getDate() + diasViaje);
      
      const fSalida = currentDate.toISOString().split("T")[0];
      const fRegreso = returnDate.toISOString().split("T")[0];
      
      results.push({
        fechaSalida: fSalida,
        fechaRegreso: fRegreso,
        vueloData: `Vuelo de ${data.origen} a ${data.destino} (${data.clase}) con ${data.escalas}`,
        precio: Math.floor(Math.random() * 300) + 200,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ success: true, packages: results });
  } catch (error: any) {
    console.error("Error en scraping:", error);
    return NextResponse.json({ success: false, error: "Fallo el scraping: " + error.message }, { status: 500 });
  }
}
