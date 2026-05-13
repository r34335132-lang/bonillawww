'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cities } from '@/lib/data'
import { cn } from '@/lib/utils'

export function SearchEngine() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [passengers, setPassengers] = useState('1')
  const [isSwapping, setIsSwapping] = useState(false)

  const handleSwap = () => {
    setIsSwapping(true)
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
    setTimeout(() => setIsSwapping(false), 300)
  }

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: origin || 'Ciudad de México',
      destination: destination || 'Guadalajara',
      date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      passengers,
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="glass-card mx-auto max-w-5xl rounded-2xl p-6 shadow-xl sm:p-8">
      <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr,1fr,1fr,auto]">
        {/* Origin */}
        <div className="space-y-2">
          <Label htmlFor="origin" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Origen
          </Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger id="origin" className="h-12 bg-background/50">
              <SelectValue placeholder="¿Desde dónde sales?" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <div className="flex items-end pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="h-12 w-12 rounded-full transition-transform hover:bg-primary/10"
          >
            <motion.div animate={{ rotate: isSwapping ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </motion.div>
          </Button>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            Destino
          </Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger id="destination" className="h-12 bg-background/50">
              <SelectValue placeholder="¿A dónde vas?" />
            </SelectTrigger>
            <SelectContent>
              {cities.filter(c => c !== origin).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            Fecha
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-12 w-full justify-start bg-background/50 text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                {date ? format(date, 'PPP', { locale: es }) : 'Selecciona fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passengers */}
        <div className="space-y-2">
          <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Pasajeros
          </Label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger id="passengers" className="h-12 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'pasajero' : 'pasajeros'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            size="lg"
            className="h-12 gap-2 px-8 transition-all hover:scale-105"
          >
            Buscar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
