'use client'

import { motion } from 'framer-motion'
import { SlidersHorizontal, Clock, Bus, DollarSign } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface SearchFiltersProps {
  filters: {
    serviceTypes: string[]
    departureTime: string[]
    maxPrice: number
  }
  onFiltersChange: (filters: SearchFiltersProps['filters']) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const serviceTypes = ['Primera Clase', 'Ejecutivo', 'Económico']
  const departureTimes = [
    { label: 'Madrugada (00:00 - 06:00)', value: 'early' },
    { label: 'Mañana (06:00 - 12:00)', value: 'morning' },
    { label: 'Tarde (12:00 - 18:00)', value: 'afternoon' },
    { label: 'Noche (18:00 - 00:00)', value: 'night' },
  ]

  const handleServiceTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.serviceTypes, type]
      : filters.serviceTypes.filter((t) => t !== type)
    onFiltersChange({ ...filters, serviceTypes: newTypes })
  }

  const handleDepartureTimeChange = (time: string, checked: boolean) => {
    const newTimes = checked
      ? [...filters.departureTime, time]
      : filters.departureTime.filter((t) => t !== time)
    onFiltersChange({ ...filters, departureTime: newTimes })
  }

  const clearFilters = () => {
    onFiltersChange({
      serviceTypes: [],
      departureTime: [],
      maxPrice: 2000,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
          Limpiar
        </Button>
      </div>

      {/* Service Type */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Bus className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">Tipo de Servicio</Label>
        </div>
        <div className="space-y-3">
          {serviceTypes.map((type) => (
            <div key={type} className="flex items-center gap-3">
              <Checkbox
                id={type}
                checked={filters.serviceTypes.includes(type)}
                onCheckedChange={(checked) => handleServiceTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={type} className="cursor-pointer text-sm text-muted-foreground">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">Horario de Salida</Label>
        </div>
        <div className="space-y-3">
          {departureTimes.map((time) => (
            <div key={time.value} className="flex items-center gap-3">
              <Checkbox
                id={time.value}
                checked={filters.departureTime.includes(time.value)}
                onCheckedChange={(checked) => handleDepartureTimeChange(time.value, checked as boolean)}
              />
              <Label htmlFor={time.value} className="cursor-pointer text-sm text-muted-foreground">
                {time.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">Precio Máximo</Label>
        </div>
        <div className="space-y-4">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={([value]) => onFiltersChange({ ...filters, maxPrice: value })}
            max={2000}
            min={100}
            step={50}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">$100</span>
            <span className="font-medium text-primary">${filters.maxPrice}</span>
            <span className="text-muted-foreground">$2000</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
