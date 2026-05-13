'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Star, Tag } from 'lucide-react'
import { benefits } from '@/lib/data'

const iconMap: Record<string, typeof Shield> = {
  shield: Shield,
  clock: Clock,
  star: Star,
  tag: Tag,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function BenefitsSection() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-wider text-primary">
            Por qué elegirnos
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Viaja con la Mejor Experiencia
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            En Bonilla Tours nos comprometemos con tu comodidad y seguridad en cada viaje
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon]
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="group relative"
              >
                <div className="glass-card relative h-full rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                    <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
