'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Calendar, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const CITIES = [
  "Durango",
  "Nombre de Dios",
  "Vicente Guerrero",
  "Sombrerete",
  "San José de Fénix",
  "Sain Alto",
  "Río Florido",
  "Fresnillo",
  "Calera",
  "Zacatecas",
  "Aguascalientes",
  "San Juan de los Lagos",
  "Guadalajara"
];

// FUNCIÓN PARA OBTENER LA FECHA LOCAL CORRECTA (Ignora el Horario Universal)
const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function SearchEngine({ floating = false }: { floating?: boolean }) {
  const router = useRouter();
  
  const [origin, setOrigin] = useState("Durango");
  const [destination, setDestination] = useState("Guadalajara");
  // Inicializamos con la fecha local correcta
  const [date, setDate] = useState(getLocalDateString()); 
  const [returnDate, setReturnDate] = useState(""); 
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState("one-way"); // one-way, round, 15-days

  // Validamos que al cargar la página por primera vez se ponga la fecha de hoy 
  // (útil para evitar errores de recarga en el servidor)
  useEffect(() => {
    setDate(getLocalDateString());
  }, []);

  const swap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      passengers: passengers.toString(),
      isRoundTrip: (tripType === "round").toString(),
      is15Days: (tripType === "15-days").toString(),
    });
    
    if (tripType === "round" && returnDate) {
      params.append("returnDate", returnDate);
    }

    router.push(`/search?${params.toString()}`);
  };

  // Obtenemos la fecha mínima permitida
  const minDate = getLocalDateString();

  return (
    <motion.form
      onSubmit={submit}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`${
        floating 
          ? "bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl dark:bg-black/80 dark:border-white/10" 
          : "bg-card shadow-lg border"
      } rounded-[2rem] p-4 md:p-5`}
    >
      {/* SELECTORES DE TIPO DE VIAJE */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 px-2">
        {['one-way', 'round', '15-days'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTripType(type);
              if (type !== 'round') setReturnDate("");
            }}
            className={`text-[11px] md:text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              tripType === type ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {type === 'one-way' ? 'Sencillo' : type === 'round' ? 'Ida y Vuelta' : 'Paquete 15 Días'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-2 items-stretch">
        
        {/* BLOQUE ORIGEN Y DESTINO */}
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <Field icon={<MapPin className="size-4 text-primary" />} label="Origen">
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="bg-transparent w-full font-bold text-foreground outline-none cursor-pointer appearance-none">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <button type="button" onClick={swap} className="hidden sm:flex shrink-0 place-items-center size-14 my-auto rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:rotate-180 duration-500">
            <ArrowRightLeft className="size-4 mx-auto" />
          </button>

          <div className="flex-1 min-w-0">
            <Field icon={<MapPin className="size-4 text-primary" />} label="Destino">
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-transparent w-full font-bold text-foreground outline-none cursor-pointer appearance-none">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* BLOQUE FECHAS Y PASAJEROS */}
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-[130px]">
            <Field icon={<Calendar className="size-4 text-primary" />} label="Ida">
              <input 
                type="date" 
                value={date} 
                min={minDate} 
                onChange={(e) => setDate(e.target.value)} 
                className="bg-transparent w-full font-bold text-foreground outline-none cursor-pointer" 
              />
            </Field>
          </div>

          {tripType === 'round' && (
            <div className="flex-1 min-w-[130px]">
              <Field icon={<Calendar className="size-4 text-primary" />} label="Regreso">
                <input 
                  type="date" 
                  value={returnDate} 
                  min={date} // No pueden regresar antes de irse
                  onChange={(e) => setReturnDate(e.target.value)} 
                  className="bg-transparent w-full font-bold text-foreground outline-none cursor-pointer" 
                  required 
                />
              </Field>
            </div>
          )}

          <div className="sm:w-[120px] shrink-0">
            <Field icon={<Users className="size-4 text-primary" />} label="Pasajeros">
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="bg-transparent w-full font-bold text-foreground outline-none cursor-pointer appearance-none text-center">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* BOTÓN BUSCAR */}
        <Button type="submit" className="h-auto min-h-[56px] px-8 rounded-2xl bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-md border-0 text-white font-bold text-lg shrink-0">
          <Search className="size-5 mr-2" /> Buscar
        </Button>

      </div>
    </motion.form>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 h-full rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/50">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}