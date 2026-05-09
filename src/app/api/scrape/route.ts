import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Iniciando scraping para:", data);

    // Iniciar Puppeteer (Headless)
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    // Mock de scraping para evitar bloqueos por ahora, pero demostrando la lógica
    const results = [];
    
    // Convertir fechas y generar combinaciones
    const startDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);
    const diasViaje = parseInt(data.diasViaje);
    
    let currentDate = new Date(startDate);
    
    // Vamos a iterar y simular la extracción
    while (currentDate <= endDate) {
      const returnDate = new Date(currentDate);
      returnDate.setDate(returnDate.getDate() + diasViaje);
      
      const fSalida = currentDate.toISOString().split("T")[0];
      const fRegreso = returnDate.toISOString().split("T")[0];
      
      console.log(`Buscando vuelos para: ${fSalida} al ${fRegreso}...`);
      
      // Aquí iría el page.goto('https://www.google.com/travel/flights...') real
      // await page.goto(`https://www.google.com/travel/flights?q=...`);
      // const precio = await page.$eval('.precio-selector', el => el.textContent);
      
      // Simulamos la extracción exitosa tras la navegación
      results.push({
        fechaSalida: fSalida,
        fechaRegreso: fRegreso,
        vueloData: `Vuelo extraído desde ${data.origen} a ${data.destino}`,
        precio: Math.floor(Math.random() * 300) + 200,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    await browser.close();

    return NextResponse.json({ success: true, packages: results });
  } catch (error) {
    console.error("Error en scraping:", error);
    return NextResponse.json({ success: false, error: "Fallo el scraping" }, { status: 500 });
  }
}
