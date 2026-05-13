'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CheckCircle2, Download, Calendar, MapPin, ArrowRight, QrCode } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SuccessPage() {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#06b6d4', '#8b5cf6'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#06b6d4', '#8b5cf6'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground sm:text-4xl"
          >
            Compra exitosa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Tu boleto ha sido confirmado. Hemos enviado los detalles a tu correo electrónico.
          </motion.p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <div className="glass-card overflow-hidden rounded-3xl">
            {/* Header */}
            <div className="bg-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-primary-foreground">
                  <div className="text-sm opacity-80">Número de confirmación</div>
                  <div className="text-xl font-bold">BT-2026-{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                </div>
                <QrCode className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Route */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">06:00</div>
                  <div className="text-sm text-muted-foreground">Ciudad de México</div>
                </div>
                <div className="flex flex-1 items-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="relative flex-1">
                    <div className="h-px w-full bg-border" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        6h 30min
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-accent" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">12:30</div>
                  <div className="text-sm text-muted-foreground">Guadalajara</div>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <Calendar className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-xs text-muted-foreground">Fecha</div>
                  <div className="font-medium text-foreground">15 Mayo, 2026</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <MapPin className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-xs text-muted-foreground">Asiento</div>
                  <div className="font-medium text-foreground">4B</div>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <div className="mx-auto flex h-5 w-5 items-center justify-center">
                    <span className="text-sm font-bold text-primary">1°</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Servicio</div>
                  <div className="font-medium text-foreground">Primera Clase</div>
                </div>
              </div>

              {/* Passenger */}
              <div className="mt-6 rounded-xl border border-dashed border-border p-4">
                <div className="text-xs text-muted-foreground">Pasajero</div>
                <div className="font-medium text-foreground">Juan Pérez García</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Descargar Boleto
          </Button>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Ver Mis Viajes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Presenta tu código QR o número de confirmación al abordar. 
          Llega al menos 30 minutos antes de la salida.
        </motion.p>
      </div>

      <Footer />
    </main>
  )
}
