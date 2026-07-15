const descriptions: Record<number,string> = {0:"Cerah",1:"Cerah berawan",2:"Berawan",3:"Mendung",45:"Berkabut",48:"Berkabut",51:"Gerimis",53:"Gerimis",55:"Gerimis lebat",61:"Hujan ringan",63:"Hujan",65:"Hujan lebat",80:"Hujan lokal",81:"Hujan lokal",82:"Hujan lebat",95:"Badai petir",96:"Badai petir",99:"Badai petir"};

export async function GET() {
  try {
    const response=await fetch("https://api.open-meteo.com/v1/forecast?latitude=-5.3827&longitude=105.0955&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FJakarta",{headers:{accept:"application/json"}});
    if(!response.ok)throw new Error("Layanan cuaca tidak tersedia.");
    const data=await response.json() as {current?:{temperature_2m:number;weather_code:number;relative_humidity_2m:number;wind_speed_10m:number;time:string}};
    if(!data.current)throw new Error("Data cuaca belum tersedia.");
    return Response.json({location:"Pesawaran, Lampung",temperature:Math.round(data.current.temperature_2m),description:descriptions[data.current.weather_code]??"Cuaca terkini",humidity:data.current.relative_humidity_2m,wind:data.current.wind_speed_10m,updatedAt:data.current.time},{headers:{"cache-control":"public, max-age=600"}});
  } catch {
    return Response.json({location:"Pesawaran, Lampung",temperature:null,description:"Data cuaca tidak tersedia",humidity:null,wind:null},{status:503});
  }
}
