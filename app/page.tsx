'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Clock, MapPin, Shield, Sparkles, Wifi } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SearchEngine } from '@/components/search-engine';
import { Button } from '@/components/ui/button';

// PRECIOS Y RUTAS EXACTAS SEGÚN TUS INDICACIONES
const POPULAR_ROUTES = [
  { from: 'Durango', to: 'Guadalajara', price: 800, image: '🏛️' },
  { from: 'Zacatecas', to: 'Guadalajara', price: 600, image: '⛰️' },
  { from: 'Durango', to: 'Aguascalientes', price: 700, image: '🎢' },
  { from: 'Fresnillo', to: 'Guadalajara', price: 600, image: '🌇' },
];

const BENEFITS = [
  { icon: Shield, title: "Viaje seguro", desc: "Choferes certificados y unidades con tecnología de punta." },
  { icon: Clock, title: "Puntualidad", desc: "98% de salidas a tiempo, monitoreo en vivo." },
  { icon: Wifi, title: "WiFi y entretenimiento", desc: "Internet de alta velocidad y contenido a bordo." },
  { icon: Award, title: "Mejor precio", desc: "Tarifas dinámicas y descuentos exclusivos en línea." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* HERO SECTION */}
      <section 
        className="relative flex-1 flex flex-col justify-center items-center w-full min-h-[85vh] sm:min-h-[90vh] pb-16 pt-24 mt-[-80px]"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('https://gisyiiljfplywcfhxxem.supabase.co/storage/v1/object/public/fls/bus.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="container mx-auto px-4 relative z-10 w-full mt-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Más de 20 años conectando México</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-md"
            >
              Viaja seguro,<br />
              <span className="text-red-500">llega a tiempo.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg md:text-xl text-gray-200 max-w-xl drop-shadow-sm font-medium"
            >
              Compra tus boletos de autobús en segundos y rastrea tus paquetes en tiempo real.
            </motion.p>
          </div>

          <div className="mt-12 max-w-5xl">
            <SearchEngine floating />
          </div>
        </div>
      </section>

      {/* SECCIÓN DE BENEFICIOS */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-4 gap-4"
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="bg-card rounded-2xl p-6 shadow-xl border border-border/50 hover:shadow-2xl transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">{b.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* RUTAS POPULARES CON PRECIOS REALES */}
      <section className="container mx-auto px-4 mt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Destinos</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">Rutas más populares</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/search">Ver todas <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_ROUTES.map((r, i) => (
            <Link 
              key={`${r.from}-${r.to}`}
              href={`/search?origin=${r.from}&destination=${r.to}&date=${new Date().toISOString().slice(0, 10)}&passengers=1&isRoundTrip=false&is15Days=false`}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg cursor-pointer h-full"
              >
                <div className="absolute -right-6 -top-6 text-9xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                  {r.image}
                </div>
                <div className="relative">
                  <div className="text-xs uppercase tracking-wider opacity-80">Desde</div>
                  <div className="text-3xl font-bold mt-1">${r.price}</div>
                  <div className="mt-6 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{r.from}</div>
                    <div className="border-l border-dashed border-primary-foreground/40 ml-1.5 h-3" />
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 fill-primary-foreground" />{r.to}</div>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-1 font-medium text-sm group-hover:gap-2 transition-all">
                    Buscar viaje <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECCIÓN PAQUETERÍA */}
      <section className="container mx-auto px-4 mt-28 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 p-10 md:p-16 text-primary-foreground shadow-xl"
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              ¿Necesitas enviar un paquete?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Rastrea tu envío en tiempo real. Cobertura nacional, seguro incluido.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-8 shadow-lg bg-background text-foreground hover:bg-background/90">
              <Link href="/tracking">Rastrear paquete <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}