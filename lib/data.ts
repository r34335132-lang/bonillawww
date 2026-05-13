export interface Trip {
  id: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  serviceType: 'Primera Clase' | 'Ejecutivo' | 'Económico'
  availableSeats: number
  busType: string
  amenities: string[]
}

export interface Seat {
  id: string
  row: number
  column: 'A' | 'B' | 'C' | 'D'
  status: 'available' | 'occupied' | 'selected'
  price: number
  type: 'standard' | 'premium'
}

export interface Ticket {
  id: string
  tripId: string
  origin: string
  destination: string
  departureDate: string
  departureTime: string
  seatNumber: string
  passengerName: string
  status: 'upcoming' | 'completed' | 'cancelled'
  qrCode: string
  price: number
}

export interface Package {
  id: string
  trackingNumber: string
  origin: string
  destination: string
  status: 'received' | 'in_transit' | 'arrived' | 'delivered'
  weight: string
  description: string
  timeline: PackageEvent[]
}

export interface PackageEvent {
  date: string
  time: string
  location: string
  description: string
  status: 'completed' | 'current' | 'pending'
}

export const popularRoutes = [
  { origin: 'Ciudad de México', destination: 'Guadalajara', price: 850, duration: '6h 30min', image: '/routes/guadalajara.jpg' },
  { origin: 'Ciudad de México', destination: 'Monterrey', price: 1200, duration: '9h 45min', image: '/routes/monterrey.jpg' },
  { origin: 'Ciudad de México', destination: 'Cancún', price: 1500, duration: '18h', image: '/routes/cancun.jpg' },
  { origin: 'Guadalajara', destination: 'Puerto Vallarta', price: 450, duration: '4h 30min', image: '/routes/vallarta.jpg' },
]

export const cities = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Cancún',
  'Puerto Vallarta',
  'Tijuana',
  'León',
  'Puebla',
  'Querétaro',
  'Mérida',
  'San Luis Potosí',
  'Aguascalientes',
  'Morelia',
  'Oaxaca',
  'Veracruz',
]

export const mockTrips: Trip[] = [
  {
    id: '1',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '06:00',
    arrivalTime: '12:30',
    duration: '6h 30min',
    price: 850,
    serviceType: 'Primera Clase',
    availableSeats: 24,
    busType: 'Volvo 9800',
    amenities: ['WiFi', 'Enchufes', 'Pantalla Personal', 'Baño', 'Aire Acondicionado']
  },
  {
    id: '2',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '08:30',
    arrivalTime: '15:00',
    duration: '6h 30min',
    price: 750,
    serviceType: 'Ejecutivo',
    availableSeats: 18,
    busType: 'Mercedes-Benz Paradiso',
    amenities: ['WiFi', 'Enchufes', 'Baño', 'Aire Acondicionado']
  },
  {
    id: '3',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '10:00',
    arrivalTime: '16:30',
    duration: '6h 30min',
    price: 650,
    serviceType: 'Económico',
    availableSeats: 32,
    busType: 'Irizar i6',
    amenities: ['Baño', 'Aire Acondicionado']
  },
  {
    id: '4',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '14:00',
    arrivalTime: '20:30',
    duration: '6h 30min',
    price: 900,
    serviceType: 'Primera Clase',
    availableSeats: 12,
    busType: 'Volvo 9800',
    amenities: ['WiFi', 'Enchufes', 'Pantalla Personal', 'Baño', 'Aire Acondicionado', 'Snacks']
  },
  {
    id: '5',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '18:00',
    arrivalTime: '00:30',
    duration: '6h 30min',
    price: 800,
    serviceType: 'Ejecutivo',
    availableSeats: 22,
    busType: 'Mercedes-Benz Paradiso',
    amenities: ['WiFi', 'Enchufes', 'Baño', 'Aire Acondicionado']
  },
  {
    id: '6',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureTime: '23:00',
    arrivalTime: '05:30',
    duration: '6h 30min',
    price: 700,
    serviceType: 'Económico',
    availableSeats: 28,
    busType: 'Irizar i6',
    amenities: ['Baño', 'Aire Acondicionado']
  },
]

export const generateSeats = (): Seat[] => {
  const seats: Seat[] = []
  const columns: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
  const occupiedSeats = ['1A', '1B', '2C', '3D', '4A', '5B', '6C', '7D', '8A', '9B']
  
  for (let row = 1; row <= 12; row++) {
    for (const col of columns) {
      const seatId = `${row}${col}`
      seats.push({
        id: seatId,
        row,
        column: col,
        status: occupiedSeats.includes(seatId) ? 'occupied' : 'available',
        price: row <= 3 ? 150 : 0,
        type: row <= 3 ? 'premium' : 'standard'
      })
    }
  }
  
  return seats
}

export const mockTickets: Ticket[] = [
  {
    id: 't1',
    tripId: '1',
    origin: 'Ciudad de México',
    destination: 'Guadalajara',
    departureDate: '2026-05-15',
    departureTime: '06:00',
    seatNumber: '4B',
    passengerName: 'Juan Pérez',
    status: 'upcoming',
    qrCode: 'BONILLA-T1-2026',
    price: 850
  },
  {
    id: 't2',
    tripId: '2',
    origin: 'Guadalajara',
    destination: 'Puerto Vallarta',
    departureDate: '2026-04-20',
    departureTime: '10:00',
    seatNumber: '2A',
    passengerName: 'Juan Pérez',
    status: 'completed',
    qrCode: 'BONILLA-T2-2026',
    price: 450
  },
  {
    id: 't3',
    tripId: '3',
    origin: 'Ciudad de México',
    destination: 'Monterrey',
    departureDate: '2026-05-25',
    departureTime: '08:00',
    seatNumber: '6C',
    passengerName: 'Juan Pérez',
    status: 'upcoming',
    qrCode: 'BONILLA-T3-2026',
    price: 1200
  },
]

export const mockPackage: Package = {
  id: 'p1',
  trackingNumber: 'BT-2026-0512-MX',
  origin: 'Ciudad de México',
  destination: 'Guadalajara',
  status: 'in_transit',
  weight: '2.5 kg',
  description: 'Documentos y electrónicos',
  timeline: [
    {
      date: '2026-05-07',
      time: '09:00',
      location: 'Ciudad de México - Terminal Central',
      description: 'Paquete recibido en terminal de origen',
      status: 'completed'
    },
    {
      date: '2026-05-07',
      time: '11:30',
      location: 'Ciudad de México - Terminal Central',
      description: 'Paquete cargado en autobús BT-450',
      status: 'completed'
    },
    {
      date: '2026-05-07',
      time: '14:00',
      location: 'En tránsito',
      description: 'Paquete en camino a destino',
      status: 'current'
    },
    {
      date: '2026-05-07',
      time: '18:00',
      location: 'Guadalajara - Terminal Norte',
      description: 'Llegada estimada a terminal de destino',
      status: 'pending'
    },
    {
      date: '2026-05-07',
      time: '18:30',
      location: 'Guadalajara - Terminal Norte',
      description: 'Disponible para recoger',
      status: 'pending'
    },
  ]
}

export const benefits = [
  {
    title: 'Viajes Seguros',
    description: 'Conductores certificados y unidades con mantenimiento constante para tu tranquilidad.',
    icon: 'shield'
  },
  {
    title: 'Puntualidad Garantizada',
    description: 'Nos comprometemos con tus horarios. Llegamos a tiempo, siempre.',
    icon: 'clock'
  },
  {
    title: 'Comodidad Premium',
    description: 'Asientos reclinables, WiFi, enchufes y entretenimiento a bordo.',
    icon: 'star'
  },
  {
    title: 'Mejor Precio',
    description: 'Tarifas competitivas y promociones exclusivas para nuestros viajeros.',
    icon: 'tag'
  },
]
