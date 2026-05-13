'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, MapPin, Users, Filter, X, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TripCard, type Trip } from '@/components/trip-card'
import { SearchFilters } from '@/components/search-filters'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// --- LÓGICA MAESTRA IMPORTADA DE LA APP (routeLogic.ts) ---
const BONILLA_ROUTE = [
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

const ROUTE_OFFSETS: Record<string, number> = {
  "Durango": 0,
  "Nombre de Dios": 45,
  "Vicente Guerrero": 75,
  "Sombrerete": 135,
  "San José de Fénix": 150,
  "Sain Alto": 165,
  "Río Florido": 180,
  "Fresnillo": 240,
  "Calera": 265,
  "Zacatecas": 285,
  "Aguascalientes": 405,
  "San Juan de los Lagos": 480,
  "Guadalajara": 600,
};

function getOccupiedSeatsForSegment(allBookings: any[], searchOrigin: string, searchDest: string): number[] {
  const startIndex = BONILLA_ROUTE.indexOf(searchOrigin);
  const endIndex = BONILLA_ROUTE.indexOf(searchDest);

  if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) return [];

  const isGoingSouth = startIndex < endIndex;
  const occupiedSeats = new Set<number>();

  allBookings.forEach((booking) => {
    if (booking.status === "cancelled") return;

    const bStart = BONILLA_ROUTE.indexOf(booking.trip.origin);
    const bEnd = BONILLA_ROUTE.indexOf(booking.trip.destination);

    if (bStart === -1 || bEnd === -1 || bStart === bEnd) return;

    const bookingGoingSouth = bStart < bEnd;

    // Si van en sentidos opuestos, nunca chocan
    if (isGoingSouth !== bookingGoingSouth) return;

    if (isGoingSouth) {
      if (bStart < endIndex && bEnd > startIndex) {
        booking.seats.forEach((seat: number) => occupiedSeats.add(seat));
      }
    } else {
      if (bStart > endIndex && bEnd < startIndex) {
        booking.seats.forEach((seat: number) => occupiedSeats.add(seat));
      }
    }
  });

  return Array.from(occupiedSeats);
}

const calculateSegmentData = (trip: any, searchOrigin: string, searchDest: string, exactPrice: number) => {
  if (!trip.departure_time) return { dep: "--:--", arr: "--:--", dur: "--", price: exactPrice };

  const [hours, minutes] = trip.departure_time.split(":").map(Number);
  const baseMinutes = hours * 60 + minutes;

  const originOffset = ROUTE_OFFSETS[searchOrigin] || 0;
  const destOffset = ROUTE_OFFSETS[searchDest] || 0;

  const depTotal = baseMinutes + originOffset;
  const arrTotal = baseMinutes + destOffset;

  const formatTime = (totalMins: number) => {
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const durationMins = Math.abs(destOffset - originOffset);
  const durH = Math.floor(durationMins / 60);
  const durM = durationMins % 60;
  const durText = durM > 0 ? `${durH}h ${durM}m` : `${durH}h`;

  return { dep: formatTime(depTotal), arr: formatTime(arrTotal), dur: durText, price: exactPrice };
};
// --- FIN LÓGICA MAESTRA ---

export default function SearchPage() {
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin') || 'Durango'
  const destination = searchParams.get('destination') || 'Guadalajara'
  const dateParam = searchParams.get('date')
  const passengers = searchParams.get('passengers') || '1'
  
  // PARÁMETROS NUEVOS PARA TARIFAS
  const isRoundTrip = searchParams.get('isRoundTrip') === 'true'
  const is15Days = searchParams.get('is15Days') === 'true'

  const date = dateParam ? new Date(dateParam + 'T00:00:00') : new Date()

  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    serviceTypes: [] as string[],
    departureTime: [] as string[],
    maxPrice: 2000,
  })

  // EFECTO PRINCIPAL DE BÚSQUEDA
  useEffect(() => {
    const fetchAndCalculateTrips = async () => {
      setIsLoading(true);
      try {
        const searchStart = BONILLA_ROUTE.indexOf(origin);
        const searchEnd = BONILLA_ROUTE.indexOf(destination);

        if (searchStart === -1 || searchEnd === -1 || searchStart === searchEnd) {
          setTrips([]);
          setIsLoading(false);
          return;
        }

        const isGoingSouth = searchStart < searchEnd;
        const searchDate = format(date, 'yyyy-MM-dd');

        // 1. Traer los camiones que salen ese día
        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select("*")
          .eq("date", searchDate);

        if (tripsError) throw tripsError;

        // 2. Filtrar camiones que cubran esta ruta (Lógica Sur/Norte)
        const validTrips = (tripsData || []).filter((trip) => {
          const tripStart = BONILLA_ROUTE.indexOf(trip.origin);
          const tripEnd = BONILLA_ROUTE.indexOf(trip.destination);
          
          if (tripStart === -1 || tripEnd === -1 || tripStart === tripEnd) return false;
          
          const tripGoesSouth = tripStart < tripEnd;
          if (isGoingSouth !== tripGoesSouth) return false;

          if (isGoingSouth) return tripStart <= searchStart && tripEnd >= searchEnd;
          else return tripStart >= searchStart && tripEnd <= searchEnd;
        });

        if (validTrips.length === 0) {
          setTrips([]);
          setIsLoading(false);
          return;
        }

        // 3. Buscar tarifa exacta en la tabla 'route_prices'
        const { data: priceData } = await supabase
          .from("route_prices")
          .select("*")
          .or(`and(origin.eq.${origin},destination.eq.${destination}),and(origin.eq.${destination},destination.eq.${origin})`)
          .single();

        // Calcular el precio correcto según el tipo de viaje
        let exactPrice = 0;
        let label = "Sencillo";
        
        if (priceData) {
          if (is15Days) { 
            exactPrice = priceData.price_15_days; 
            label = "Paquete 15 Días"; 
          }
          else if (isRoundTrip) { 
            exactPrice = priceData.price_round_trip; 
            label = "Ida y Vuelta"; 
          }
          else { 
            exactPrice = priceData.price_one_way; 
            label = "Sencillo"; 
          }
        }

        // 4. Formatear y calcular tiempos de desfase para la web
        const formattedTrips = validTrips.map(t => {
          const finalPrice = exactPrice > 0 ? exactPrice : t.price;
          const segmentData = calculateSegmentData(t, origin, destination, finalPrice);
          
          return {
            id: t.id,
            origin: origin, 
            destination: destination,
            date: t.date,
            departureTime: segmentData.dep,
            arrivalTime: segmentData.arr,
            duration: segmentData.dur,
            price: segmentData.price, 
            priceLabel: label, // Mandamos la etiqueta del precio a la tarjeta
            availableSeats: t.available_seats,
            totalSeats: t.total_seats || 40,
            serviceType: t.bus_type || 'Ejecutivo',
            busType: t.bus_type || 'Ejecutivo',
            amenities: typeof t.amenities === 'string' ? JSON.parse(t.amenities) : (t.amenities || []),
          };
        });

        const tripIds = formattedTrips.map((t) => t.id);
        
        // 5. Calcular la disponibilidad real de asientos cruzando con la tabla de reservas
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("trip_id, status, seats, origin, destination")
          .in("trip_id", tripIds)
          .neq("status", "cancelled");

        let finalTrips = formattedTrips;
        
        if (bookingsData) {
          finalTrips = formattedTrips.map((trip) => {
            const tripBookings = bookingsData
              .filter((b) => b.trip_id === trip.id)
              .map((b: any) => ({
                status: b.status,
                seats: b.seats,
                trip: { origin: b.origin, destination: b.destination },
              }));

            const occupiedSeats = getOccupiedSeatsForSegment(tripBookings, origin, destination);
            return {
              ...trip,
              availableSeats: trip.totalSeats - occupiedSeats.length,
            };
          });
        }

        setTrips(finalTrips);
      } catch (err) {
        console.error("Error cargando viajes en la web:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculateTrips();
  }, [origin, destination, dateParam, isRoundTrip, is15Days]);

  // Filtrado local interactivo
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(trip.serviceType)) return false;
      if (trip.price > filters.maxPrice) return false;
      if (filters.departureTime.length > 0 && trip.departureTime && trip.departureTime !== "--:--") {
        const hour = parseInt(trip.departureTime.split(':')[0]);
        const timeSlot = hour < 6 ? 'early' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'night';
        if (!filters.departureTime.includes(timeSlot)) return false;
      }
      return true;
    });
  }, [filters, trips]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card shadow-sm border border-border/50 mb-8 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg text-foreground">{origin}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg text-foreground">{destination}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="h-5 w-5 text-primary/70" />
                <span className="capitalize">{format(date, 'EEEE, d MMM', { locale: es })}</span>
                {/* Mostramos el tipo de boleto en el resumen */}
                {(isRoundTrip || is15Days) && (
                  <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-md">
                    {is15Days ? "15 DÍAS" : "REDONDO"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Users className="h-5 w-5 text-primary/70" />
                <span>{passengers} {parseInt(passengers) === 1 ? 'Pasajero' : 'Pasajeros'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-bold text-foreground">
              {isLoading ? 'Calculando tarifas y asientos...' : `${filteredTrips.length} viajes disponibles`}
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Conectando con el tarifario de Bonilla Tours' : 'Elige el horario que mejor se adapte a ti'}
            </p>
          </motion.div>

          <Button variant="outline" className="gap-2 lg:hidden border-primary/20 text-primary hover:bg-primary/10" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="flex gap-8">
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute left-0 top-0 h-full w-full max-w-sm overflow-auto bg-background p-6 shadow-xl border-r">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-primary">Filtros</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></Button>
                </div>
                <SearchFilters filters={filters} onFiltersChange={setFilters} />
              </motion.div>
            </motion.div>
          )}

          <div className="flex-1 space-y-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Calculando tarifas y asientos...</h3>
              </div>
            ) : filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => <TripCard key={trip.id} trip={trip} index={index} />)
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-dashed border-border/60 rounded-3xl p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Filter className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No hay viajes para esta ruta</h3>
                <p className="text-muted-foreground max-w-md mx-auto">No encontramos horarios que coincidan con tu búsqueda. Intenta buscar para otra fecha.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}