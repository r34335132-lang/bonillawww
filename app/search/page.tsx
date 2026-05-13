'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, MapPin, Users, Filter, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TripCard } from '@/components/trip-card'
import { SearchFilters } from '@/components/search-filters'
import { Button } from '@/components/ui/button'
import { mockTrips } from '@/lib/data'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin') || 'Ciudad de México'
  const destination = searchParams.get('destination') || 'Guadalajara'
  const dateParam = searchParams.get('date')
  const passengers = searchParams.get('passengers') || '1'

  const date = dateParam ? new Date(dateParam) : new Date()

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    serviceTypes: [] as string[],
    departureTime: [] as string[],
    maxPrice: 2000,
  })

  const filteredTrips = useMemo(() => {
    return mockTrips.filter((trip) => {
      // Filter by service type
      if (filters.serviceTypes.length > 0 && !filters.serviceTypes.includes(trip.serviceType)) {
        return false
      }

      // Filter by price
      if (trip.price > filters.maxPrice) {
        return false
      }

      // Filter by departure time
      if (filters.departureTime.length > 0) {
        const hour = parseInt(trip.departureTime.split(':')[0])
        const timeSlot =
          hour < 6 ? 'early' :
          hour < 12 ? 'morning' :
          hour < 18 ? 'afternoon' : 'night'
        
        if (!filters.departureTime.includes(timeSlot)) {
          return false
        }
      }

      return true
    })
  }, [filters])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Search Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card mb-8 rounded-2xl p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{origin}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <span className="font-medium text-foreground">{destination}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{format(date, 'PPP', { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{passengers} {parseInt(passengers) === 1 ? 'pasajero' : 'pasajeros'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-foreground">
              {filteredTrips.length} viajes disponibles
            </h1>
            <p className="text-muted-foreground">
              Elige el horario que mejor se adapte a ti
            </p>
          </motion.div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="gap-2 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden w-72 shrink-0 lg:block">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="absolute left-0 top-0 h-full w-full max-w-sm overflow-auto bg-background p-6 shadow-xl"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <SearchFilters filters={filters} onFiltersChange={setFilters} />
              </motion.div>
            </motion.div>
          )}

          {/* Trip Results */}
          <div className="flex-1 space-y-4">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <TripCard key={trip.id} trip={trip} index={index} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No encontramos viajes
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Intenta ajustar los filtros para ver más opciones
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters({ serviceTypes: [], departureTime: [], maxPrice: 2000 })}
                >
                  Limpiar Filtros
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
