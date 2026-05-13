'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Seat } from '@/lib/data'

interface SeatMapProps {
  seats: Seat[]
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  maxSelections: number
}

export function SeatMap({ seats, selectedSeats, onSeatSelect, maxSelections }: SeatMapProps) {
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return
    
    if (selectedSeats.includes(seat.id)) {
      onSeatSelect(seat.id)
    } else if (selectedSeats.length < maxSelections) {
      onSeatSelect(seat.id)
    }
  }

  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b)

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-muted border border-border" />
          <span className="text-sm text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary" />
          <span className="text-sm text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-muted-foreground/20" />
          <span className="text-sm text-muted-foreground">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30" />
          <span className="text-sm text-muted-foreground">Premium (+$150)</span>
        </div>
      </div>

      {/* Bus Frame */}
      <div className="mx-auto max-w-md">
        {/* Driver Area */}
        <div className="mb-4 flex items-center justify-between rounded-t-3xl bg-muted/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Conductor</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Entrada</div>
            <div className="flex gap-1">
              <div className="h-6 w-3 rounded-sm bg-muted" />
              <div className="h-6 w-3 rounded-sm bg-muted" />
            </div>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-2 rounded-b-3xl border border-border bg-muted/30 p-4">
          {/* Column Labels */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="grid w-full max-w-[280px] grid-cols-[1fr_1fr_2rem_1fr_1fr] gap-2 text-center text-xs font-medium text-muted-foreground">
              <span>A</span>
              <span>B</span>
              <span></span>
              <span>C</span>
              <span>D</span>
            </div>
          </div>

          {rows.map((row) => {
            const rowSeats = seats.filter((s) => s.row === row)
            const leftSeats = rowSeats.filter((s) => s.column === 'A' || s.column === 'B')
            const rightSeats = rowSeats.filter((s) => s.column === 'C' || s.column === 'D')

            return (
              <div key={row} className="flex items-center justify-center gap-2">
                <div className="grid w-full max-w-[280px] grid-cols-[1fr_1fr_2rem_1fr_1fr] gap-2">
                  {/* Left side seats */}
                  {['A', 'B'].map((col) => {
                    const seat = leftSeats.find((s) => s.column === col)
                    if (!seat) return <div key={col} />
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.includes(seat.id)}
                        onClick={() => handleSeatClick(seat)}
                      />
                    )
                  })}

                  {/* Aisle with row number */}
                  <div className="flex items-center justify-center text-xs text-muted-foreground">
                    {row}
                  </div>

                  {/* Right side seats */}
                  {['C', 'D'].map((col) => {
                    const seat = rightSeats.find((s) => s.column === col)
                    if (!seat) return <div key={col} />
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.includes(seat.id)}
                        onClick={() => handleSeatClick(seat)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bathroom */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 8a2 2 0 01-2-2 2 2 0 012-2h16a2 2 0 012 2 2 2 0 01-2 2M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8" />
            </svg>
            <span className="text-xs text-muted-foreground">Baño</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SeatButtonProps {
  seat: Seat
  isSelected: boolean
  onClick: () => void
}

function SeatButton({ seat, isSelected, onClick }: SeatButtonProps) {
  const isOccupied = seat.status === 'occupied'
  const isPremium = seat.type === 'premium'

  return (
    <motion.button
      whileHover={!isOccupied ? { scale: 1.1 } : {}}
      whileTap={!isOccupied ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isOccupied}
      className={cn(
        'relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-200',
        isOccupied && 'cursor-not-allowed bg-muted-foreground/20 text-muted-foreground/50',
        !isOccupied && !isSelected && isPremium && 'bg-amber-500/20 border border-amber-500/30 text-amber-700 hover:bg-amber-500/30',
        !isOccupied && !isSelected && !isPremium && 'bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:border-primary/50',
        isSelected && 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
      )}
    >
      <AnimatePresence mode="wait">
        {isSelected ? (
          <motion.span
            key="selected"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {seat.id}
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {seat.id}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
