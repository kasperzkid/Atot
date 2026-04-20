import { 
  Wifi, 
  Wind, 
  Tv, 
  Coffee,
  Shield,
  Music,
  Wine,
  Camera
} from "lucide-react";

export interface Room {
  id: string;
  img: string;
  type: 'Royal Elite' | 'Signature Heritage' | 'Executive Residency' | 'Classic Hospitality';
  name: string;
  price: number;
  desc: string;
  amenities: any[];
  maxGuests: number;
}

export const rooms: Room[] = [
  // ROYAL ELITE COLLECTION
  { 
    id: 'atat-pres-suite',
    img: '/presidential_suite.png', 
    type: 'Royal Elite', 
    name: 'Atot Grand Presidential', 
    price: 1500, 
    desc: 'The pinnacle of luxury with panoramic city views, private butler service, and exclusive entry.',
    amenities: [Wifi, Wind, Tv, Coffee, Shield, Wine],
    maxGuests: 4
  },
  { 
    id: 'royal-penthouse',
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800', 
    type: 'Royal Elite', 
    name: 'Sky Garden Penthouse', 
    price: 1800, 
    desc: 'A sanctuary above the clouds featuring a private terrace and 360-degree glass walls.',
    amenities: [Wifi, Wind, Tv, Music, Camera],
    maxGuests: 6
  },

  // SIGNATURE HERITAGE SUITES
  { 
    id: 'heritage-suite-1',
    img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800', 
    type: 'Signature Heritage', 
    name: 'Atot Heritage Suite', 
    price: 750, 
    desc: 'Classic Ethiopian charm blended with modern high-end finishes and artisanal decor.',
    amenities: [Wifi, Wind, Tv, Coffee],
    maxGuests: 2
  },
  { 
    id: 'king-signature',
    img: '/deluxe_king_room.png', 
    type: 'Signature Heritage', 
    name: 'Signature King Room', 
    price: 600, 
    desc: 'Bespoke design elements meeting unparalleled comfort in our most requested king-tier room.',
    amenities: [Wifi, Tv, Coffee],
    maxGuests: 2
  },

  // EXECUTIVE RESIDENCY
  { 
    id: 'exec-res-1',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', 
    type: 'Executive Residency', 
    name: 'Executive Studio', 
    price: 450, 
    desc: 'Perfectly optimized for the modern leader, featuring a dedicated workspace and high-speed connectivity.',
    amenities: [Wifi, Wind, Tv, Coffee],
    maxGuests: 2
  },
  { 
    id: 'business-double',
    img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800', 
    type: 'Executive Residency', 
    name: 'Executive Double Residency', 
    price: 550, 
    desc: 'Spacious dual-occupancy room designed for business partners or family travelers.',
    amenities: [Wifi, Tv, Coffee],
    maxGuests: 4
  },

  // CLASSIC HOSPITALITY
  { 
    id: 'classic-comfort',
    img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800', 
    type: 'Classic Hospitality', 
    name: 'Classic Comfort Garden', 
    price: 250, 
    desc: 'Essential luxury in a peaceful garden setting, featuring all the hallmarks of Atot hospitality.',
    amenities: [Wifi, Tv],
    maxGuests: 2
  },
  { 
    id: 'classic-twin',
    img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800', 
    type: 'Classic Hospitality', 
    name: 'Classic Twin Guestroom', 
    price: 220, 
    desc: 'Refined comfort with versatile twin bedding and modern essential amenities.',
    amenities: [Wifi, Tv],
    maxGuests: 2
  }
];
