'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, QrCode, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Ticket } from '@/lib/data'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface TicketCardProps {
  ticket: Ticket
  index: number
}

export function TicketCard({ ticket, index }: TicketCardProps) {
  const statusConfig = {
    upcoming: {
      label: 'Próximo',
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    completed: {
      label: 'Completado',
      className: 'bg-muted text-muted-foreground border-muted',
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  }

  const status = statusConfig[ticket.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card overflow-hidden rounded-2xl"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {ticket.qrCode}
            </span>
          </div>

          {/* Route */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{ticket.departureTime}</div>
              <div className="text-sm text-muted-foreground">{ticket.origin.split(' ')[0]}</div>
            </div>
            <div className="flex flex-1 items-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1 border-t border-dashed border-border" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 border-t border-dashed border-border" />
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {/* Calculate arrival time estimate */}
                {(() => {
                  const [hours, mins] = ticket.departureTime.split(':').map(Number)
                  const arrivalHours = (hours + 6) % 24
                  const arrivalMins = (mins + 30) % 60
                  return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMins.toString().padStart(2, '0')}`
                })()}
              </div>
              <div className="text-sm text-muted-foreground">{ticket.destination.split(' ')[0]}</div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(parseISO(ticket.departureDate), 'PPP', { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Asiento {ticket.seatNumber}</span>
            </div>
          </div>

          {/* Passenger */}
          <div className="mt-4 text-sm text-muted-foreground">
            Pasajero: <span className="font-medium text-foreground">{ticket.passengerName}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center border-t border-dashed border-border bg-muted/30 p-6 lg:w-48 lg:border-l lg:border-t-0">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-background">
            <QrCode className="h-16 w-16 text-foreground" />
          </div>
          {ticket.status === 'upcoming' && (
            <Button variant="ghost" size="sm" className="mt-3 gap-2">
              <Download className="h-4 w-4" />
              Descargar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
