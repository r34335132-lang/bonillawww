'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Wifi, Plug, Monitor, Bath, Wind, UtensilsCrossed, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Trip } from '@/lib/data'
import Link from 'next/link'

const amenityIcons: Record<string, typeof Wifi> = {
  'WiFi': Wifi,
  'Enchufes': Plug,
  'Pantalla Personal': Monitor,
  'Baño': Bath,
  'Aire Acondicionado': Wind,
  'Snacks': UtensilsCrossed,
}

interface TripCardProps {
  trip: Trip
  index: number
}

export function TripCard({ trip, index }: TripCardProps) {
  const serviceColors: Record<string, string> = {
    'Primera Clase': 'bg-amber-500/10 text-amber-600 border-amber-200',
    'Ejecutivo': 'bg-primary/10 text-primary border-primary/20',
    'Económico': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group glass-card overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Time and Route */}
          <div className="flex flex-1 items-center gap-6">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{trip.departureTime}</div>
              <div className="text-sm text-muted-foreground">{trip.origin.split(',')[0]}</div>
            </div>

            {/* Duration Line */}
            <div className="flex flex-1 items-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="relative flex-1">
                <div className="h-px w-full bg-border" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{trip.duration}</span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{trip.arrivalTime}</div>
              <div className="text-sm text-muted-foreground">{trip.destination.split(',')[0]}</div>
            </div>
          </div>

          {/* Service Info */}
          <div className="flex flex-col items-center gap-2 lg:items-end">
            <Badge variant="outline" className={serviceColors[trip.serviceType]}>
              {trip.serviceType}
            </Badge>
            <div className="text-sm text-muted-foreground">{trip.busType}</div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap items-center gap-2 lg:max-w-[200px]">
            {trip.amenities.slice(0, 5).map((amenity) => {
              const Icon = amenityIcons[amenity]
              return Icon ? (
                <div
                  key={amenity}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10"
                  title={amenity}
                >
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              ) : null
            })}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{trip.availableSeats} disponibles</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">MXN</span>
              <span className="text-3xl font-bold text-primary">${trip.price}</span>
            </div>
            <Link href={`/seats?tripId=${trip.id}`}>
              <Button className="gap-2 transition-all hover:scale-105">
                Seleccionar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
