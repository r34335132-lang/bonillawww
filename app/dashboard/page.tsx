'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Ticket, Clock, CheckCircle2, XCircle, Bus, Settings, LogOut, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TicketCard } from '@/components/ticket-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('upcoming')
  
  // Estados de Autenticación y Datos
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Agrupamos los tickets reales que vienen de la BD
  const [tickets, setTickets] = useState({
    upcoming: [] as any[],
    completed: [] as any[],
    cancelled: [] as any[]
  })

  // EFECTO PRINCIPAL: Verificar sesión y traer los boletos de Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Verificar Sesión
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth')
          return
        }
        setUser(session.user)

        // 2. Traer los boletos (bookings) del usuario, cruzando datos con la tabla de viajes (trips)
        // Nota: Asumimos que guardas el 'user_id' o 'email' en la tabla bookings.
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            id, 
            status, 
            seats, 
            passenger_name, 
            created_at,
            trips (
              id,
              origin,
              destination,
              date,
              departure_time
            )
          `)
          .eq('email', session.user.email) // O .eq('user_id', session.user.id) dependiendo de tu BD

        if (!error && bookingsData) {
          // 3. Formateamos los datos para que la TicketCard los pueda leer
          const formattedTickets = bookingsData.map((b: any) => ({
            id: b.id,
            tripId: b.trips?.id || '',
            origin: b.trips?.origin || 'Desconocido',
            destination: b.trips?.destination || 'Desconocido',
            departureDate: b.trips?.date || b.created_at,
            departureTime: b.trips?.departure_time || '--:--',
            // Los asientos vienen como arreglo [1, 2], los convertimos a texto
            seatNumber: Array.isArray(b.seats) ? b.seats.join(', ') : b.seats,
            passengerName: b.passenger_name || session.user.user_metadata?.full_name || 'Pasajero',
            // Mapeamos estados de la BD a los de la UI
            status: b.status === 'paid' || b.status === 'active' ? 'upcoming' : b.status, 
            qrCode: b.id, // Usamos el ID de la reserva como QR
            price: 0
          }))

          setTickets({
            upcoming: formattedTickets.filter(t => t.status === 'upcoming'),
            completed: formattedTickets.filter(t => t.status === 'completed'),
            cancelled: formattedTickets.filter(t => t.status === 'cancelled')
          })
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  // Lógica para cerrar sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Si está cargando, mostramos un loader
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold">Cargando tu cuenta...</h2>
        </div>
      </main>
    )
  }

  // Si por alguna razón no hay usuario (prevención de destellos visuales antes del redirect)
  if (!user) return null

  // Cálculo de estadísticas
  const stats = [
    { label: 'Viajes Próximos', value: tickets.upcoming.length, icon: Clock, color: 'text-primary' },
    { label: 'Viajes Completados', value: tickets.completed.length, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Cancelados', value: tickets.cancelled.length, icon: XCircle, color: 'text-destructive' },
  ]

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Viajero Bonilla'

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          
          {/* SIDEBAR (Columna Izquierda) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72"
          >
            <div className="bg-card border border-border/50 shadow-sm rounded-[2rem] p-6">
              {/* Información del Usuario Dinámica */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-foreground truncate">{userName}</h2>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="mb-6 grid grid-cols-3 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-muted/40 p-3 text-center border border-border/30">
                    <stat.icon className={`mx-auto h-5 w-5 ${stat.color}`} />
                    <div className="mt-1 text-xl font-black text-foreground">{stat.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 truncate">{stat.label.split(' ')[1] || stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Menú de Navegación Lateral */}
              <nav className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary font-bold">
                  <Ticket className="h-5 w-5" />
                  <span>Mis Viajes</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground hover:bg-muted/50 font-bold transition-colors">
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-bold transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </div>

            {/* Tarjeta de Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 border border-primary/20 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg"
            >
              <Bus className="h-8 w-8" />
              <h3 className="mt-3 font-bold text-lg">Planea tu próximo viaje</h3>
              <p className="mt-1 text-sm opacity-90 font-medium">
                Descubre nuevas rutas y ofertas especiales.
              </p>
              <Link href="/search">
                <Button variant="secondary" className="mt-5 w-full rounded-xl font-bold bg-background text-foreground hover:bg-background/90">
                  Buscar Viajes
                </Button>
              </Link>
            </motion.div>
          </motion.aside>

          {/* CONTENIDO PRINCIPAL (Lista de Boletos) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-black text-foreground">Mis Viajes</h1>
              <p className="text-muted-foreground font-medium mt-1">
                Gestiona tus boletos y revisa el historial de tus compras.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full justify-start bg-card border border-border/50 h-14 rounded-2xl p-1 shadow-sm overflow-x-auto overflow-y-hidden">
                <TabsTrigger value="upcoming" className="gap-2 rounded-xl px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold">
                  <Clock className="h-4 w-4" /> Próximos ({tickets.upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 rounded-xl px-4 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Completados ({tickets.completed.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="gap-2 rounded-xl px-4 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold">
                  <XCircle className="h-4 w-4" /> Cancelados ({tickets.cancelled.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6 outline-none">
                {tickets.upcoming.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.upcoming.map((ticket: any, index: number) => (
                      <TicketCard key={ticket.id} ticket={ticket} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tienes viajes próximos" description="Busca y reserva tu próximo viaje en nuestro sistema." />
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6 outline-none">
                {tickets.completed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.completed.map((ticket: any, index: number) => (
                      <TicketCard key={ticket.id} ticket={ticket} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tienes viajes completados" description="Tu historial de viajes aparecerá aquí una vez que viajes." />
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-6 outline-none">
                {tickets.cancelled.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.cancelled.map((ticket: any, index: number) => (
                      <TicketCard key={ticket.id} ticket={ticket} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tienes viajes cancelados" description="Los viajes que hayan sido cancelados aparecerán aquí." />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </div>

      <Footer />
    </main>
  )
}

// Componente para cuando no hay resultados en la pestaña
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-card border border-dashed border-border/60 rounded-[2rem] p-12 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Ticket className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground font-medium max-w-sm mx-auto">{description}</p>
      <Link href="/search">
        <Button className="mt-6 rounded-xl font-bold px-8 h-12 bg-primary text-white hover:scale-[1.02] transition-transform">
          Buscar Viajes
        </Button>
      </Link>
    </div>
  )
}