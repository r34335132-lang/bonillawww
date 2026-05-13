'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Ticket, Clock, CheckCircle2, XCircle, Bus, Settings, LogOut } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TicketCard } from '@/components/ticket-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockTickets } from '@/lib/data'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const upcomingTickets = mockTickets.filter((t) => t.status === 'upcoming')
  const completedTickets = mockTickets.filter((t) => t.status === 'completed')
  const cancelledTickets = mockTickets.filter((t) => t.status === 'cancelled')

  const stats = [
    { label: 'Viajes Próximos', value: upcomingTickets.length, icon: Clock, color: 'text-primary' },
    { label: 'Viajes Completados', value: completedTickets.length, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Cancelados', value: cancelledTickets.length, icon: XCircle, color: 'text-destructive' },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72"
          >
            <div className="glass-card rounded-2xl p-6">
              {/* User Info */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Juan Pérez</h2>
                  <p className="text-sm text-muted-foreground">juan@email.com</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mb-6 grid grid-cols-3 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-muted/50 p-3 text-center">
                    <stat.icon className={`mx-auto h-5 w-5 ${stat.color}`} />
                    <div className="mt-1 text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label.split(' ')[0]}</div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 text-primary">
                  <Ticket className="h-5 w-5" />
                  <span className="font-medium">Mis Viajes</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted/50">
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted/50">
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 glass-card rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground"
            >
              <Bus className="h-8 w-8" />
              <h3 className="mt-3 font-semibold">Planea tu próximo viaje</h3>
              <p className="mt-1 text-sm opacity-80">
                Descubre nuevas rutas y ofertas especiales
              </p>
              <Link href="/search">
                <Button variant="secondary" className="mt-4 w-full">
                  Buscar Viajes
                </Button>
              </Link>
            </motion.div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Mis Viajes</h1>
              <p className="text-muted-foreground">
                Gestiona tus boletos y revisa el historial de viajes
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full justify-start bg-muted/50">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Próximos ({upcomingTickets.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completados ({completedTickets.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Cancelados ({cancelledTickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingTickets.length > 0 ? (
                  upcomingTickets.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} />
                  ))
                ) : (
                  <EmptyState
                    title="No tienes viajes próximos"
                    description="Busca y reserva tu próximo viaje"
                  />
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedTickets.length > 0 ? (
                  completedTickets.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} />
                  ))
                ) : (
                  <EmptyState
                    title="No tienes viajes completados"
                    description="Tu historial de viajes aparecerá aquí"
                  />
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {cancelledTickets.length > 0 ? (
                  cancelledTickets.map((ticket, index) => (
                    <TicketCard key={ticket.id} ticket={ticket} index={index} />
                  ))
                ) : (
                  <EmptyState
                    title="No tienes viajes cancelados"
                    description="Los viajes cancelados aparecerán aquí"
                  />
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Ticket className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Link href="/search">
        <Button className="mt-4">Buscar Viajes</Button>
      </Link>
    </div>
  )
}
