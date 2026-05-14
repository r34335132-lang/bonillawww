'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, Clock, Ticket, ArrowRight, Home, Download, Share2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Recuperamos la info del viaje
  const origin = searchParams.get('origin') || 'Durango'
  const destination = searchParams.get('destination') || 'Zacatecas'
  const seats = searchParams.get('seats')?.split(',') || ['13']
  const date = searchParams.get('date') || new Date().toLocaleDateString()
  const time = searchParams.get('time') || '05:00 PM'
  const price = searchParams.get('price') || '0'
  const passengerName = searchParams.get('name') || 'Pasajero Principal'
  const transactionId = searchParams.get('clip_ref') || 'BT-' + Math.random().toString(36).substr(2, 9).toUpperCase()

  // Generamos el código QR con la URL correcta
  const qrUrl = encodeURIComponent(`https://bonillawww.vercel.app/?folio=${transactionId}`);

  // FUNCIÓN PARA GENERAR EL MISMO TICKET QUE EN EL PANEL ADMIN
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    
    const html = `<!DOCTYPE html><html><head><title>Boleto ${transactionId}</title><style>@page { size: 58mm auto; margin: 0mm; } body { width: 58mm !important; max-width: 58mm !important; margin: 0 !important; padding: 0 !important; background-color: #fff; color: #000; font-family: 'Courier New', Courier, monospace; } .boleto { width: 58mm; padding: 2mm 2mm; box-sizing: border-box; } .text-center { text-align: center; } .text-bold { font-weight: bold; } .logo { max-width: 40mm; margin: 0 auto 5px; display: block; } .divider { border-bottom: 1px dashed #000; margin: 6px 0; } .item { margin-bottom: 4px; } .label { font-size: 9px; font-weight: bold; display: block; } .value { font-size: 11px; display: block; margin-left: 2px; word-break: break-word; } .dest-box { border: 1px solid #000; padding: 4px; text-align: center; margin: 6px 0; } .dest-label { font-size: 9px; font-weight: bold; margin-bottom: 2px; } .dest-value { font-size: 13px; font-weight: bold; text-transform: uppercase; } .qr-container { text-align: center; margin: 8px 0; } .qr-code { width: 35mm; height: 35mm; margin: 0 auto; display: block; } .terms { font-size: 8px; text-align: left; margin-top: 8px; line-height: 1.1; } .terms h4 { font-size: 9px; text-align: center; margin: 0 0 4px 0; border-bottom: 1px solid #000; padding-bottom: 2px; } .terms p { margin: 2px 0; }</style></head><body><div class="boleto"><img src="https://gisyiiljfplywcfhxxem.supabase.co/storage/v1/object/public/fls/WhatsApp%20Image%202026-05-04%20at%205.53.38%20PM.jpeg" class="logo" alt="Bonilla Tours" /><div class="text-center text-bold" style="font-size: 12px;">BOLETO DE VIAJE</div><div class="divider"></div><div class="item"><span class="label">Pasajero:</span> <span class="value">${passengerName}</span></div><div class="dest-box"><div class="dest-label">RUTA</div><div class="dest-value">${origin} ➔ ${destination}</div></div><div class="item"><span class="label">Fecha y Hora:</span> <span class="value">${date} - ${time}</span></div><div class="item"><span class="label">Asiento(s):</span> <span class="value">${seats.length > 0 ? seats.join(', ') : 'Asignado al abordar'}</span></div><div class="item"><span class="label">Total Pagado:</span> <span class="value text-bold">$${Number(price).toFixed(2)} MXN</span></div><div class="divider"></div><div class="qr-container"><img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrUrl}" alt="QR" /><div class="label" style="margin-top:4px;">Folio de Reserva</div><div class="text-bold" style="font-size: 13px;">${transactionId}</div><div style="font-size: 8px; margin-top: 4px;">Emitido: ${new Date().toLocaleString()}</div></div><div class="divider"></div><div class="terms"><h4>TÉRMINOS Y CONDICIONES</h4><p>- Preséntese 20 min antes de su viaje.</p><p>- Muestre el QR o este ticket impreso para abordar.</p><p>- Tolerancia máx de 5 min en espera.</p><p>- Puntos de ascenso/descenso sujetos a cambios.</p><p>- Cancelaciones: 10% de cargo, mín. 1 hr en oficina.</p></div></div><script>window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }</script></body></html>`;
    printWindow.document.write(html); 
    printWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-muted/30 flex flex-col">
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
            <h1 className="text-3xl font-black text-foreground">¡Reservación Exitosa!</h1>
            <p className="text-muted-foreground mt-2">Guarda tu comprobante para abordar.</p>
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
                  Confirmado
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
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrUrl}`} alt="QR Code" className="w-full h-full opacity-90" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Referencia de Pago</p>
                <code className="text-sm font-black text-foreground">{transactionId}</code>
              </div>
            </div>
          </motion.div>

          {/* BOTONES DE ACCIÓN */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button variant="outline" className="rounded-2xl h-14 font-bold border-border bg-card hover:bg-muted" onClick={handlePrint}>
              <Download className="size-4 mr-2" /> Descargar Ticket
            </Button>
            <Button variant="outline" className="rounded-2xl h-14 font-bold border-border bg-card hover:bg-muted">
              <Share2 className="size-4 mr-2" /> Compartir
            </Button>
            <Button className="col-span-2 rounded-2xl h-14 font-black bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" onClick={() => router.push('/')}>
              <Home className="size-5 mr-2" /> Volver al Inicio
            </Button>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-muted/30 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando confirmación...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
