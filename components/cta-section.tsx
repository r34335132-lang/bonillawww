'use client'

import { motion } from 'framer-motion'
import { Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="h-full w-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              {/* Content */}
              <div className="text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
                  <Package className="h-4 w-4" />
                  Servicio de Paquetería
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                  Envía tus paquetes con nosotros
                </h2>
                <p className="mt-4 max-w-xl text-lg text-white/80">
                  Servicio de paquetería confiable y rápido a todos nuestros destinos. 
                  Rastrea tu envío en tiempo real.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <Link href="/tracking">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 bg-white text-primary hover:bg-white/90"
                  >
                    Rastrear Paquete
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 text-white hover:bg-white/10 hover:text-white"
                  >
                    Cotizar Envío
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}
