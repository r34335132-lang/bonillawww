'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Wifi, Plug, Monitor, Bath, Wind, UtensilsCrossed, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export interface Trip {
  id: string | number;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  serviceType: string;
  busType: string;
  amenities: string[];
  availableSeats: number;
  totalSeats?: number;
  priceLabel?: string;
}

const amenityIcons: Record<string, typeof Wifi> = {
  'WiFi': Wifi,
  'Enchufes': Plug,
  'Pantalla Personal': Monitor,
  'Baño': Bath,
  'Aire Acondicionado': Wind,
  'Snacks': UtensilsCrossed,
}

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const serviceColors: Record<string, string> = {
    'Primera Clase': 'bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400',
    'Ejecutivo': 'bg-primary/10 text-primary border-primary/30',
    'Económico': 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400',
  }

  const total = trip.totalSeats || 40;
  const isAlmostFull = trip.availableSeats < (total * 0.2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card border border-border/60 overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-between">

          {/* --- BLOQUE 1: TIEMPOS Y RUTA --- */}
          <div className="flex flex-1 items-center justify-between gap-2 sm:gap-4 w-full">
            <div className="text-center min-w-[70px]">
              <div className="text-3xl font-black text-foreground tracking-tight">{trip.departureTime}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">{trip.origin.substring(0, 3)}</div>
            </div>

            <div className="flex flex-1 flex-col items-center px-2">
              <span className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">{trip.duration}</span>
              <div className="w-full flex items-center relative">
                <div className="h-2.5 w-2.5 rounded-full border-[2px] border-primary bg-background z-10 shrink-0" />
                <div className="flex-1 h-[2px] bg-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-0 bg-primary group-hover:w-full transition-all duration-700 ease-out"/>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-primary z-10 shrink-0" />
              </div>
            </div>

            <div className="text-center min-w-[70px]">
              <div className="text-3xl font-black text-foreground tracking-tight">{trip.arrivalTime}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">{trip.destination.substring(0, 3)}</div>
            </div>
          </div>

          <div className="h-px w-full bg-border/50 lg:hidden" />

          {/* --- BLOQUE 2: INFO DEL BUS Y ASIENTOS --- */}
          <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 w-full lg:w-auto lg:px-8 lg:border-l border-border/50 shrink-0">
            <div className="flex flex-col items-start lg:items-center gap-2">
              <Badge variant="outline" className={`px-3 py-1 font-bold ${serviceColors[trip.serviceType] || serviceColors['Ejecutivo']}`}>
                {trip.serviceType || 'Ejecutivo'}
              </Badge>
              <div className="flex gap-1.5 flex-wrap max-w-[120px] justify-start lg:justify-center">
                {trip.amenities?.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return <Icon key={amenity} className="size-4 text-muted-foreground" title={amenity} />
                })}
              </div>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${isAlmostFull ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <Users className="size-3.5" />
              {trip.availableSeats} libres
            </div>
          </div>

          <div className="h-px w-full bg-border/50 lg:hidden" />

          {/* --- BLOQUE 3: PRECIO Y BOTÓN --- */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 w-full lg:w-auto shrink-0 lg:min-w-[180px]">
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-[-4px]">
                {trip.priceLabel || 'Sencillo'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-muted-foreground">MXN</span>
                <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">${trip.price}</span>
              </div>
            </div>

            <Link href={`/seats?tripId=${trip.id}&price=${trip.price}&label=${trip.priceLabel || 'Sencillo'}&origin=${trip.origin}&destination=${trip.destination}`} className="w-full sm:w-auto mt-auto">
              <Button className="w-full bg-primary text-white h-11 px-6 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-md">
                Seleccionar <ArrowRight className="size-4 ml-2 hidden sm:inline" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  )
}