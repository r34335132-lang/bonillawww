'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, MapPin, Package, Truck } from 'lucide-react'
import type { PackageEvent } from '@/lib/data'
import { cn } from '@/lib/utils'

interface TrackingTimelineProps {
  events: PackageEvent[]
}

const statusIcons = {
  completed: CheckCircle2,
  current: Truck,
  pending: Circle,
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = statusIcons[event.status]
        const isLast = index === events.length - 1

        return (
          <motion.div
            key={`${event.date}-${event.time}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative flex gap-4 pb-8"
          >
            {/* Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[15px] top-8 h-full w-0.5',
                  event.status === 'completed' ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                event.status === 'completed' && 'bg-primary text-primary-foreground',
                event.status === 'current' && 'bg-primary text-primary-foreground animate-pulse',
                event.status === 'pending' && 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    event.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {event.description}
                </span>
                {event.status === 'current' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    En curso
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{event.date} - {event.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
