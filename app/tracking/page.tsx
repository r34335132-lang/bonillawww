'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, MapPin, Weight, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TrackingTimeline } from '@/components/tracking-timeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

// Definimos la estructura del resultado que usará la interfaz
interface PackageEvent {
  status: 'completed' | 'current' | 'pending';
  description: string;
  location: string;
  date: string;
  time: string;
}

interface PackageResult {
  trackingNumber: string;
  status: 'received' | 'in_transit' | 'arrived' | 'delivered';
  origin: string;
  destination: string;
  weight: string;
  description: string;
  timeline: PackageEvent[];
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<PackageResult | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    const trimmedTracking = trackingNumber.trim().toUpperCase();
    
    if (!trimmedTracking) {
      setError('Ingresa un número de guía')
      return
    }

    setIsSearching(true)
    setError('')
    setResult(null)

    try {
      // Extraemos solo el número del formato PAQ-123
      let folioNumber = trimmedTracking;
      if (trimmedTracking.startsWith('PAQ-')) {
        folioNumber = trimmedTracking.replace('PAQ-', '');
      }

      const folioInt = parseInt(folioNumber, 10);

      if (isNaN(folioInt)) {
        setError('Formato de guía no válido. Usa el formato PAQ-123')
        setIsSearching(false)
        return
      }

      // Consulta a la base de datos de Supabase
      const { data, error: sbError } = await supabase
        .from('parcels')
        .select('*')
        .eq('folio', folioInt)
        .single()

      if (sbError || !data) {
        setError('No encontramos ningún paquete con ese número de guía')
        setIsSearching(false)
        return
      }

      // Mapeamos el estado de la base de datos al estado de la interfaz
      let mappedStatus: PackageResult['status'] = 'received';
      if (data.status === 'en_transito') mappedStatus = 'in_transit';
      if (data.status === 'entregado') mappedStatus = 'delivered';

      // Creamos la fecha formateada de cuando se registró el paquete
      const creationDate = new Date(data.created_at);
      const dateStr = creationDate.toLocaleDateString('es-MX');
      const timeStr = creationDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      // Generamos una línea de tiempo dinámica en base al estado
      const timeline: PackageEvent[] = [
        {
          status: 'completed',
          description: 'Paquete recibido en oficina',
          location: data.origin,
          date: dateStr,
          time: timeStr
        }
      ];

      // Paso 2: En tránsito
      if (data.status === 'en_transito' || data.status === 'entregado') {
        timeline.push({
          status: data.status === 'entregado' ? 'completed' : 'current',
          description: 'Paquete en ruta hacia su destino',
          location: `Viajando a ${data.destination}`,
          date: data.status === 'entregado' ? 'Completado' : 'Actualizando...',
          time: '--:--'
        });
      } else {
        timeline.push({
          status: 'pending',
          description: 'Salida de autobús programada',
          location: data.origin,
          date: 'Pendiente',
          time: '--:--'
        });
      }

      // Paso 3: Entregado
      if (data.status === 'entregado') {
        timeline.push({
          status: 'completed',
          description: 'Llegó a sucursal de destino',
          location: data.destination,
          date: 'Completado',
          time: '--:--'
        });
      } else {
        timeline.push({
          status: 'pending',
          description: 'Llegada a sucursal de destino',
          location: data.destination,
          date: 'Pendiente',
          time: '--:--'
        });
      }

      // Actualizamos el resultado en la pantalla
      setResult({
        trackingNumber: `PAQ-${data.folio}`,
        status: mappedStatus,
        origin: data.origin,
        destination: data.destination,
        weight: 'No especificado', // Puedes añadir peso a tu BD después si lo requieres
        description: `A nombre de: ${data.receiver_name} (Enviado por: ${data.sender_name})`,
        timeline: timeline
      });

    } catch (err) {
      console.error(err);
      setError('Hubo un error al intentar buscar tu paquete. Intenta de nuevo.')
    }

    setIsSearching(false)
  }

  const statusLabels = {
    received: { label: 'En Bodega', color: 'bg-blue-500' },
    in_transit: { label: 'En Tránsito', color: 'bg-amber-500' },
    arrived: { label: 'En Terminal', color: 'bg-emerald-500' },
    delivered: { label: 'Llegó a Destino', color: 'bg-green-600' },
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
                  placeholder="Ej: PAQ-123"
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
                    <span className="text-sm text-muted-foreground">Pasajeros: </span>
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
                description: 'Conoce exactamente dónde se encuentra tu paquete',
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