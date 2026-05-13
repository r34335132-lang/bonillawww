'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, MapPin, Weight, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TrackingTimeline } from '@/components/tracking-timeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockPackage } from '@/lib/data'

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<typeof mockPackage | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('Ingresa un número de guía')
      return
    }

    setIsSearching(true)
    setError('')
    setResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo purposes, show result for any tracking number that starts with "BT"
    if (trackingNumber.toUpperCase().startsWith('BT')) {
      setResult({ ...mockPackage, trackingNumber: trackingNumber.toUpperCase() })
    } else {
      setError('No encontramos ningún paquete con ese número de guía')
    }

    setIsSearching(false)
  }

  const statusLabels = {
    received: { label: 'Recibido', color: 'bg-blue-500' },
    in_transit: { label: 'En Tránsito', color: 'bg-amber-500' },
    arrived: { label: 'En Terminal', color: 'bg-emerald-500' },
    delivered: { label: 'Entregado', color: 'bg-green-600' },
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rastrear Paquete</h1>
          <p className="mt-2 text-muted-foreground">
            Ingresa tu número de guía para conocer el estado de tu envío
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Package className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ej: BT-2026-0512-MX"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 pl-12 text-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                size="lg"
                className="h-14 gap-2 px-8"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Rastrear
                  </>
                )}
              </Button>
            </div>

            {/* Demo hint */}
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Prueba con: <button onClick={() => setTrackingNumber('BT-2026-0512-MX')} className="font-medium text-primary hover:underline">BT-2026-0512-MX</button>
            </p>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-destructive"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-6"
            >
              {/* Package Summary */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-foreground">
                        {result.trackingNumber}
                      </h2>
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white ${statusLabels[result.status].color}`}>
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        {statusLabels[result.status].label}
                      </div>
                    </div>
                    <p className="mt-1 text-muted-foreground">{result.description}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-6 flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                  <div className="text-center">
                    <MapPin className="mx-auto h-5 w-5 text-primary" />
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {result.origin.split(' - ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">Origen</div>
                  </div>
                  <div className="flex flex-1 items-center">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <div className="flex-1 border-t border-dashed border-border" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 border-t border-dashed border-border" />
                    <div className="h-1 w-1 rounded-full bg-accent" />
                  </div>
                  <div className="text-center">
                    <MapPin className="mx-auto h-5 w-5 text-accent" />
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {result.destination.split(' - ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">Destino</div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Peso: </span>
                    <span className="text-sm font-medium text-foreground">{result.weight}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Contenido: </span>
                    <span className="text-sm font-medium text-foreground">{result.description}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="mb-6 text-lg font-semibold text-foreground">
                  Historial de Movimientos
                </h3>
                <TrackingTimeline events={result.timeline} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        {!result && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid gap-6 sm:grid-cols-3"
          >
            {[
              {
                icon: Package,
                title: 'Envío Seguro',
                description: 'Tu paquete viaja protegido en nuestras unidades',
              },
              {
                icon: MapPin,
                title: 'Rastreo en Tiempo Real',
                description: 'Sigue tu envío en cada etapa del trayecto',
              },
              {
                icon: Search,
                title: 'Actualizaciones',
                description: 'Recibe notificaciones del estado de tu paquete',
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-xl p-5 text-center">
                <item.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  )
}
