'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { popularRoutes } from '@/lib/data'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export function PopularRoutes() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-wider text-primary">
            Destinos Populares
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Rutas Más Buscadas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Descubre nuestros destinos más populares y comienza tu próxima aventura
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {popularRoutes.map((route, index) => (
            <motion.div
              key={`${route.origin}-${route.destination}`}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-1"
            >
              <div className="relative h-full overflow-hidden rounded-xl bg-card">
                {/* Gradient Background */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                
                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{route.origin}</span>
                  </div>
                  
                  <div className="my-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{route.destination}</span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">desde</span>
                      <div className="text-xl font-bold text-primary">
                        ${route.price}
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/search?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}`}
                    className="mt-4 block"
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2 transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Ver Horarios
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
