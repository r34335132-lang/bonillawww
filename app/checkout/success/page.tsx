'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, Clock, MapPin, Ticket, ArrowRight, Home, Download, Share2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Recuperamos la info del viaje
  const origin = searchParams.get('origin') || 'Durango'
  const destination = searchParams.get('destination') || 'Zacatecas'
  const seats = searchParams.get('seats')?.split(',') || ['13']
  const date = searchParams.get('date') || new Date().toLocaleDateString()
  const time = searchParams.get('time') || '05:00 PM' // Si la tienes, se mostrará
  const price = searchParams.get('price') || '450'
  const passengerName = searchParams.get('name') || 'Pasajero Principal'
  const busNumber = searchParams.get('bus') || '110'
  const transactionId = searchParams.get('clip_ref') || 'BT-' + Math.random().toString(36).substr(2, 9).toUpperCase()

  // Generamos el código corto (DUR, ZAC, GDL, etc.)
  const shortOrigin = origin.substring(0, 3).toUpperCase()
  const shortDest = destination.substring(0, 3).toUpperCase()

  return (
    <>
      {/* ========================================================================
        1. VISTA WEB (VISIBLE EN PANTALLA, OCULTA AL IMPRIMIR/DESCARGAR PDF)
        ========================================================================
      */}
      <main className="min-h-screen bg-muted/30 flex flex-col print:hidden">
        <Header />

        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-xl w-full">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center size-20 bg-emerald-500 rounded-full mb-4 shadow-lg shadow-emerald-200">
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-foreground">¡Pago Confirmado!</h1>
              <p className="text-muted-foreground mt-2">Tu reservación ha sido completada con éxito.</p>
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card border border-border border-b-0 rounded-t-[2.5rem] p-8 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Boleto Digital</p>
                    <h2 className="text-xl font-bold">Bonilla Tours</h2>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1">
                    Pagado
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-muted-foreground uppercase mb-1">Origen</div>
                    <div className="text-2xl font-black text-foreground uppercase">{origin}</div>
                  </div>
                  <div className="px-4 text-primary">
                    <ArrowRight className="size-6" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm font-bold text-muted-foreground uppercase mb-1">Destino</div>
                    <div className="text-2xl font-black text-foreground uppercase">{destination}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 border-t border-dashed border-border pt-6">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span>
                    </div>
                    <p className="font-bold text-sm">{date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-muted-foreground mb-1">
                      <Clock className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hora</span>
                    </div>
                    <p className="font-bold text-sm">{time}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Ticket className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Asientos</span>
                    </div>
                    <p className="font-bold text-sm">{seats.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
                    </div>
                    <p className="text-lg font-black text-primary">${Number(price).toLocaleString()} MXN</p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center h-4 bg-card border-x border-border">
                <div className="absolute -left-3 size-6 rounded-full bg-muted/30 border border-border" />
                <div className="w-full border-t-2 border-dotted border-border/50 mx-4" />
                <div className="absolute -right-3 size-6 rounded-full bg-muted/30 border border-border" />
              </div>

              <div className="bg-card border border-border border-t-0 rounded-b-[2.5rem] p-8 pb-10 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="size-32 bg-white rounded-2xl border border-border flex items-center justify-center mb-4 p-2 overflow-hidden">
                    {/* Generamos QR real con la API basándonos en el Transaction ID */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${transactionId}`} alt="QR Code" className="w-full h-full opacity-90" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Referencia de Pago</p>
                  <code className="text-sm font-black text-foreground">{transactionId}</code>
                </div>
              </div>
            </motion.div>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button variant="outline" className="rounded-2xl h-14 font-bold border-border bg-card" onClick={() => window.print()}>
                <Download className="size-4 mr-2" /> Descargar Ticket
              </Button>
              <Button variant="outline" className="rounded-2xl h-14 font-bold border-border bg-card">
                <Share2 className="size-4 mr-2" /> Compartir
              </Button>
              <Button className="col-span-2 rounded-2xl h-14 font-black bg-primary text-white shadow-lg shadow-primary/20" onClick={() => router.push('/')}>
                <Home className="size-5 mr-2" /> Volver al Inicio
              </Button>
            </div>

          </div>
        </div>

        <Footer />
      </main>

      {/* ========================================================================
        2. TICKET DE IMPRESIÓN (OCULTO EN PANTALLA, VISIBLE AL DESCARGAR/IMPRIMIR)
        ========================================================================
      */}
      <div className="hidden print:flex flex-col items-center justify-center w-full min-h-screen bg-white">
        <div className="w-[340px] border-[2px] border-gray-200 rounded-3xl p-6 bg-white shadow-none text-black">
          
          {/* Header del Ticket */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary tracking-tighter">BONILLA TOURS</h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Viaje seguro llega a tiempo</p>
          </div>

          {/* Datos del Pasajero */}
          <div className="mb-6">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Pasajero</p>
            <p className="text-xl font-black uppercase text-gray-900">{passengerName}</p>
          </div>

          {/* Origen y Destino Grandes */}
          <div className="flex items-center justify-between mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900">{shortOrigin}</p>
            </div>
            <ArrowRight className="size-6 text-gray-300" />
            <div className="text-center">
              <p className="text-4xl font-black text-gray-900">{shortDest}</p>
            </div>
          </div>

          {/* Detalles en Grid */}
          <div className="grid grid-cols-2 gap-y-6 mb-8 border-y border-dashed border-gray-300 py-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Fecha</p>
              <p className="text-sm font-black text-gray-900">{date}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Hora</p>
              <p className="text-sm font-black text-gray-900">{time}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Asiento</p>
              <p className="text-sm font-black text-gray-900">{seats.join(', ')}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Autobús</p>
              <p className="text-sm font-black text-gray-900">{busNumber}</p>
            </div>
          </div>

          {/* Zona de QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="size-40 bg-white p-2 border-2 border-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transactionId}`} alt="QR Code" className="w-full h-full" />
            </div>
            <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mt-2">Escanea para abordar</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">REF: {transactionId}</p>
          </div>

        </div>
      </div>
    </>
  )
}