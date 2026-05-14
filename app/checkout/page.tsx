'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, User, CreditCard, Ticket, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Trip details from URL
  const tripId = searchParams.get('tripId')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const seatsParam = searchParams.get('seats')
  const priceParam = searchParams.get('price')
  const is15Days = searchParams.get('is15Days') === 'true'
  const isRoundTrip = searchParams.get('isRoundTrip') === 'true'
  const returnDate = searchParams.get('returnDate')

  const seats = seatsParam ? seatsParam.split(',') : []
  const price = priceParam ? parseFloat(priceParam) : 0
  const totalPrice = price * seats.length

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [step, setStep] = useState<'details' | 'payment'>('details')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'reserve'>('card')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()

        setFormData(prev => ({
          ...prev,
          name: profile?.name || session.user.user_metadata?.name || '',
          email: session.user.email || '',
        }))
        setStep('details')
      }
    }
    checkUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Por favor, completa todos los campos requeridos.')
      return
    }
    setStep('payment')
  }

  const handleConfirmBooking = async () => {
    if (!tripId || seats.length === 0) {
      toast.error('Error: Faltan datos del viaje o asientos.')
      return
    }

    setLoading(true)
    try {
      // 1. Crear el boleto de IDA
      const bookingRef = "BT-" + Math.floor(100000 + Math.random() * 900000).toString().slice(0, 6);
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_ref: bookingRef,
          trip_id: tripId,
          user_id: user?.id || null,
          passenger_name: formData.name,
          passenger_email: formData.email,
          passenger_phone: formData.phone,
          seats: seats.map(s => parseInt(s)), 
          total_price: totalPrice,
          status: 'pending',
          payment_method: paymentMethod === 'card' ? 'card' : 'cash',
          is_guest: !user,
          origin: origin?.trim(),
          destination: destination?.trim(),
          is_round_trip: isRoundTrip,
          is_15_days: is15Days
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // 2. Lógica para el BOLETO DUPLICADO DE REGRESO
      let returnTripId = null;

      let finalReturnDate = returnDate && returnDate !== 'undefined' && returnDate !== 'null' ? returnDate : null;
      if ((is15Days || isRoundTrip) && !finalReturnDate) {
        let d = new Date();
        if (date && date !== 'undefined' && date !== 'null') {
           const [year, month, day] = date.split('-');
           if (year && month && day) d = new Date(Number(year), Number(month) - 1, Number(day));
        }
        d.setDate(d.getDate() + (is15Days ? 15 : 1)); 
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        finalReturnDate = `${y}-${m}-${dd}`;
      }

      if ((isRoundTrip || is15Days) && finalReturnDate) {
        const { data: existingTrips } = await supabase
          .from('trips')
          .select('id')
          .eq('date', finalReturnDate)
          .eq('origin', destination?.trim() || '')
          .eq('destination', origin?.trim() || '')
          .limit(1);

        if (existingTrips && existingTrips.length > 0) {
          returnTripId = existingTrips[0].id;
        } else {
          // CLONAMOS TODOS LOS CAMPOS QUE EXIGE LA BASE DE DATOS
          const { data: tripData } = await supabase.from('trips').select('*').eq('id', tripId).single()
          
          const { data: newTrip, error: tripError } = await supabase
            .from('trips')
            .insert({
              origin: destination?.trim() || '',
              destination: origin?.trim() || '',
              date: finalReturnDate,
              departure_time: '22:00', // 10 PM para compensar zona horaria a 8 PM
              arrival_time: '08:00',   
              duration: tripData?.duration || "Automático Regreso", // DATO FALTANTE
              price: tripData?.price || 0,
              prices: {}, // DATO FALTANTE
              round_trip_prices: {}, // DATO FALTANTE
              price_15_days: tripData?.price_15_days || 0,
              available_seats: tripData?.total_seats || 40,
              total_seats: tripData?.total_seats || 40,
              occupied_seats: [], // DATO FALTANTE
              bus_type: tripData?.bus_type || "Estándar",
              amenities: tripData?.amenities || []
            })
            .select('id')
            .single();

          if (!tripError && newTrip) {
            returnTripId = newTrip.id;
          } else {
            console.error("No se pudo crear viaje de regreso", tripError);
            toast.error(`Aviso: Hubo un error de BD al generar el camión de regreso (${tripError?.message}). Se procesará solo el boleto de ida.`);
          }
        }

        // Duplicar el boleto a costo $0 con la ruta inversa
        if (returnTripId) {
          const returnBookingRef = "BT-R" + Math.floor(100000 + Math.random() * 900000).toString().slice(0, 5);
          
          const { error: returnBookingError } = await supabase
            .from('bookings')
            .insert({
              booking_ref: returnBookingRef,
              trip_id: returnTripId,
              user_id: user?.id || null,
              seats: seats.map(s => parseInt(s)), 
              passenger_name: formData.name,
              passenger_email: formData.email,
              passenger_phone: formData.phone,
              payment_method: paymentMethod === 'card' ? 'card' : 'cash',
              status: 'pending', 
              is_guest: !user,
              total_price: 0, 
              origin: destination?.trim(),
              destination: origin?.trim(),
              is_round_trip: isRoundTrip, 
              is_15_days: is15Days
            });
            
            if (returnBookingError) console.error("Error duplicando boleto", returnBookingError)

            await supabase.from('bookings').update({ 
              return_trip_id: returnTripId 
            }).eq('id', bookingData.id);
        }
      }

      // 3. Procesar el pago o la reserva
      if (paymentMethod === 'card') {
        try {
          const unitPrice = totalPrice / seats.length;
          const tipoViajeStr = is15Days ? 'Paquete 15 Días' : isRoundTrip ? 'Redondo' : 'Sencillo';
          
          const { data, error } = await supabase.functions.invoke('create-clip-payment', {
            body: {
              title: `Viaje ${tipoViajeStr}: ${origin} a ${destination}`,
              quantity: seats.length,
              price: unitPrice,
              email: formData.email,
              bookingId: bookingData.id 
            }
          });

          if (error) throw new Error(`Conexión fallida con Clip: ${error.message}`);
          if (data && data.ok === false) throw new Error(`Clip rechazó el pago: ${data.error}`);
          if (!data?.payment_url) throw new Error("No se recibió el link de pago.");
          
          window.location.href = data.payment_url;
          return; 

        } catch (clipError: any) {
          console.error("Error al iniciar Clip:", clipError);
          toast.error("Hubo un problema al conectar con el procesador de pagos. Puedes intentar reservar pagando en taquilla.");
          setLoading(false);
          return;
        }

      } else {
        router.push(`/checkout/success?bookingId=${bookingData.id}&clip_ref=${bookingData.id}&name=${encodeURIComponent(formData.name)}&origin=${encodeURIComponent(origin || '')}&destination=${encodeURIComponent(destination || '')}&date=${encodeURIComponent(date || '')}&time=${encodeURIComponent(time || '')}&seats=${seats.join(',')}&price=${totalPrice}&status=pending`)
      }

    } catch (error: any) {
      console.error('Error booking trip:', error)
      toast.error('Ocurrió un error al procesar tu reserva. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!tripId || seats.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">No se encontraron detalles del viaje. Por favor, realiza una nueva búsqueda.</p>
              <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 hover:bg-transparent"
          onClick={() => step === 'payment' ? setStep('details') : router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'payment' ? 'Volver a datos del pasajero' : 'Volver'}
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            {step === 'details' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    Datos del Pasajero Principal
                  </CardTitle>
                  <CardDescription>
                    Ingresa los datos de la persona que realizará el viaje.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleContinueToPayment}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ej. Juan Pérez" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="tu@correo.com" required />
                      <p className="text-xs text-gray-500">A este correo enviaremos tu boleto.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono Móvil</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="10 dígitos" required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full h-12 text-lg">Continuar al Pago</Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Método de Pago
                  </CardTitle>
                  <CardDescription>Selecciona cómo deseas asegurar tu lugar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('card')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}><CreditCard className="h-5 w-5" /></div>
                          <span className="font-bold text-lg">Pago Seguro con Tarjeta</span>
                        </div>
                        {paymentMethod === 'card' && <CheckCircle className="h-6 w-6 text-primary" />}
                      </div>
                      <p className="text-sm text-gray-500 ml-12">Paga ahora con tarjeta a través de Clip y asegura tu boleto instantáneamente.</p>
                    </div>

                    <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'reserve' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('reserve')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${paymentMethod === 'reserve' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}><Ticket className="h-5 w-5" /></div>
                          <span className="font-bold text-lg">Reservar (Pago en Taquilla)</span>
                        </div>
                        {paymentMethod === 'reserve' && <CheckCircle className="h-6 w-6 text-primary" />}
                      </div>
                      <p className="text-sm text-gray-500 ml-12">Aparta tus asientos ahora y paga en efectivo al abordar. <strong className="text-amber-600">Tienes 2 horas para pagar antes de que la reserva expire.</strong></p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleConfirmBooking} disabled={loading} className="w-full h-14 text-lg font-bold">
                    {loading ? <span className="flex items-center gap-2"><div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</span> : paymentMethod === 'card' ? 'Pagar y Confirmar' : 'Confirmar Reserva'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="w-full md:w-1/3">
            <Card className="sticky top-24 border-primary/20 shadow-md">
              <div className="h-2 w-full bg-primary rounded-t-xl" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumen de tu Viaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-black">{time}</p>
                    <p className="text-sm font-semibold text-gray-500">{origin}</p>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="h-[2px] w-full bg-gray-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">{destination}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-semibold">{date}</span>
                  </div>
                  
                  {is15Days ? (
                     <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo de Viaje:</span>
                      <span className="font-semibold text-purple-600">Paquete 15 Días</span>
                    </div>
                  ) : isRoundTrip ? (
                     <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Regreso:</span>
                      <span className="font-semibold text-primary">{returnDate}</span>
                    </div>
                  ) : (
                     <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-semibold">Sencillo</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Asientos ({seats.length}):</span>
                    <span className="font-semibold">{seats.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 font-semibold">Total a pagar</span>
                    <span className="text-2xl font-black text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                  {is15Days && (
                    <p className="text-xs text-purple-600 text-right font-semibold">Tarifa Especial Aplicada</p>
                  )}
                  <p className="text-xs text-gray-400 text-right mt-1">Pesos Mexicanos (MXN)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-gray-500 font-medium">Preparando pago...</p>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
