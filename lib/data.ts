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

// ESTA ES LA FUNCIÓN CLAVE CORREGIDA PARA QUE HAGA MATCH CON TU APP MÓVIL Y BASE DE DATOS
export const generateSeats = (totalSeats: number = 40): Seat[] => {
  const seats: Seat[] = []
  const columns: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
  let currentSeatId = 1;
  
  // Calculamos cuántas filas necesitamos (4 asientos por fila)
  const totalRows = Math.ceil(totalSeats / 4);
  
  for (let row = 1; row <= totalRows; row++) {
    for (const col of columns) {
      if (currentSeatId > totalSeats) break; // Si ya llegamos al máximo (ej. 40), paramos
      
      seats.push({
        id: String(currentSeatId), // Aquí está la magia: Ahora el id es "1", "2", "3"...
        row,
        column: col,
        status: 'available', // Supabase se encargará de cambiar esto a 'occupied'
        price: 0, // Si quisieras cobrar más por los primeros asientos, podrías poner una lógica aquí
        type: 'standard'
      })
      
      currentSeatId++;
    }
  }
  
  return seats
}

// Los mockTrips se quedan aquí por si alguna página (fuera de la de búsqueda) aún los requiere como respaldo
export const mockTrips: Trip[] = []
export const mockTickets: Ticket[] = []
export const mockPackage: Package = {
  id: 'p1',
  trackingNumber: 'BT-2026-0512-MX',
  origin: 'Ciudad de México',
  destination: 'Guadalajara',
  status: 'in_transit',
  weight: '2.5 kg',
  description: 'Documentos',
  timeline: []
}
export const benefits = []