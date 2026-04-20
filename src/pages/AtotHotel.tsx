import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Plane, 
  Utensils, 
  Waves, 
  Flower2, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Star,
  Tv,
  Wind,
  Coffee,
  CheckCircle2,
  Calendar,
  Users
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { rooms } from '../data/roomData';
import Footer from '../components/Footer';

const AtotHotel = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const params = new URLSearchParams();
    formData.forEach((value, key) => params.append(key, value.toString()));
    navigate(`/rooms?${params.toString()}`);
  };

  const scrollToRooms = () => {
    navigate('/book');
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFDFD] text-[#0A0A0A] font-sans selection:bg-[#F97316] selection:text-white overflow-x-hidden">
      
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 left-0 w-full z-[1000] flex items-center justify-between px-8 md:px-16 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm h-20' : 'bg-transparent h-24'}`}>
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-1 no-underline">
            <span className="text-3xl font-bold tracking-tighter text-black font-sans">Atot Hotel</span>
            <div className="w-2 h-2 rounded-full bg-[#F97316] mt-2 shadow-sm"></div>
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-gray-700 tracking-wide">
          <a href="#" className="hover:text-[#F97316] transition-colors no-underline">Home</a>
          <a href="#about" className="hover:text-[#F97316] transition-colors no-underline">About Us</a>
          <a href="#rooms" className="hover:text-[#F97316] transition-colors no-underline">Our Rooms</a>
          <a href="#services" className="hover:text-[#F97316] transition-colors no-underline">Services</a>
          <a href="#contact" className="hover:text-[#F97316] transition-colors no-underline">Contact</a>
        </div>

        <button 
          onClick={scrollToRooms}
          className="bg-black hover:bg-gray-800 text-white rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl px-8 py-3 text-sm font-semibold transition-all flex items-center gap-2 group"
        >
          Book Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* ─── Hero Section with Integrated Booking Bar ─── */}
      <section className="relative pt-32 pb-40 px-8 md:px-16 flex flex-col items-center justify-center min-h-[100vh] lg:min-h-screen" id="home">
        {/* Background abstract gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-[#FDFDFD] -z-10"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-orange-50/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10"></div>

        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-10 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
              <div className="flex text-black">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">5-Star Luxury</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight">
              A Stay that <span className="text-[#F97316] font-serif italic font-normal">Whispers</span> Luxury
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-light">
              Secure your next trip in seconds. Fast, reliable, and always the best price. Enjoy modern comfort in the heart of the city.
            </p>

            <div className="flex items-center gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tighter">250,000+</div>
                <div className="text-sm text-gray-500">Total Books</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tighter">19,000+</div>
                <div className="text-sm text-gray-500">Total Hotels</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-end">
            <div className="relative w-full max-w-lg">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                 <img 
                   src="/luxury_hotel_hero.png" 
                   alt="Atot Hotel Architecture" 
                   className="w-full h-full object-cover"
                 />
              </div>
              
              {/* Floating Review Card - Adjusting to fit better and avoid overflow */}
              <div className="absolute top-12 -left-4 md:-left-12 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-xl w-48 md:w-64 border border-gray-100 flex gap-4 items-start z-20">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src="/presidential_suite.png" alt="Suite preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm">Luxury Redefined</h4>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1 line-clamp-2">Discover unparalleled service and five-star amenities.</p>
                </div>
              </div>

              {/* Floating Promo Card - Adjusting to fit better and avoid overflow */}
              <div className="absolute bottom-12 -left-8 md:-left-20 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-xl w-48 md:w-64 border border-gray-100 flex gap-4 items-start z-20">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src="/deluxe_king_room.png" alt="Room preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm">Your Perfect Stay</h4>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1 line-clamp-2">Ideally located near major attractions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Minimal Hero Booking Bar ─── */}
        <div className="absolute bottom-0 translate-y-1/2 w-full max-w-5xl px-8 z-[100] left-1/2 -translate-x-1/2">
          <form onSubmit={handleBookSubmit} className="bg-white p-3 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col md:flex-row gap-2 items-center">
            
            <div className="flex-1 w-full flex items-center px-6 py-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-colors group">
              <Calendar className="w-5 h-5 text-gray-400 mr-4 group-focus-within:text-[#F97316] transition-colors" />
              <div className="flex-1 text-left relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Check-in</label>
                <input name="checkin" type="date" required className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:ring-0 outline-none cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 w-full flex items-center px-6 py-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-colors group">
              <Calendar className="w-5 h-5 text-gray-400 mr-4 group-focus-within:text-[#F97316] transition-colors" />
              <div className="flex-1 text-left relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Check-out</label>
                <input name="checkout" type="date" required className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:ring-0 outline-none cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 w-full flex items-center px-6 py-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-colors group">
              <Users className="w-5 h-5 text-gray-400 mr-4 group-focus-within:text-[#F97316] transition-colors" />
              <div className="flex-1 text-left relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Guests</label>
                <input name="guests" type="number" min="1" defaultValue="2" required className="w-full bg-transparent border-none p-0 text-sm font-semibold text-black focus:ring-0 outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-[#F97316] hover:bg-[#EA6C0A] text-white px-8 py-5 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl font-bold h-full transition-colors flex items-center justify-center gap-3 flex-shrink-0 whitespace-nowrap group">
              Check Availability <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* spacer to accommodate the overlapping booking bar */}
      <div className="h-24 md:h-32 pointer-events-none"></div>

      {/* ─── About Us ─── */}
      <section id="about" className="px-8 md:px-16 py-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200" 
                alt="Atot Hotel Heritage" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-[#F97316] text-white p-8 rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-bold mb-1">15+</div>
              <div className="text-sm font-medium uppercase tracking-wider">Years of Excellence</div>
            </div>
          </div>
          
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <Badge className="bg-orange-100 text-[#F97316] font-bold px-4 py-1 border-none uppercase tracking-widest text-[10px]">Our Story</Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-black leading-tight">Heritage & Hospitality Defined</h2>
            </div>
            
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              Atot Hotel is more than just a destination; it's a testament to timeless elegance and the art of luxury living. Founded on the principles of unparalleled service and architectural brilliance, we have become a beacon of 5-star hospitality.
            </p>
            
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              From our meticulously designed suites to our Michelin-star culinary experiences, every detail is crafted to provide a stay that whispers luxury.
            </p>
            
            <div className="pt-4">
              <Link to="/heritage" className="bg-black text-white px-8 py-4 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 group no-underline inline-flex">
                Discover Our Heritage <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Services ─── */}
      <section id="services" className="px-8 md:px-16 py-24 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-black">Unparalleled Facilities</h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed">
              We offer world-class amenities designed to cater to your every need, combining modern elegance with unmatched comfort.
            </p>
          </div>
          <button className="text-sm font-bold uppercase tracking-wider hover:text-[#F97316] transition-colors border-b border-black hover:border-[#F97316] pb-1">
            See All Amenities
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Wifi, title: 'High-Speed WiFi', desc: 'Seamless connectivity throughout the entire hotel premises.' },
            { icon: Utensils, title: 'Fine Dining', desc: 'Michelin-star rated culinary experiences by master chefs.' },
            { icon: Waves, title: 'Infinity Pool', desc: 'Temperature-controlled rooftop pool with panoramic views.' },
            { icon: Flower2, title: 'Luxury Spa', desc: 'Holistic wellness treatments and deep tissue massages.' },
            { icon: Clock, title: '24/7 Room Service', desc: 'Gourmet meals delivered to your suite at any hour.' },
            { icon: Plane, title: 'Airport Chauffeur', desc: 'Private luxury transfers to and from the international airport.' },
          ].map((service, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center mb-6 group-hover:bg-[#F97316] group-hover:text-white transition-colors duration-300">
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 mt-4 text-black">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Our Rooms (Reverted to Old Design + Overflow Fix) ─── */}
      <section id="rooms" className="px-8 md:px-16 py-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20 text-center">
          <div className="space-y-6">
            <Badge className="bg-orange-100 text-[#F97316] font-bold px-4 py-2 border-none">Our Regular Rooms</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-black">Designed for comfort, built for luxury</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {rooms.slice(0, 3).map((room, i) => (
              <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-gray-100 h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={room.img} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <Badge className="absolute top-6 left-6 bg-[#F97316] text-white border-none px-4 py-2 font-bold shadow-lg">{room.type}</Badge>
                </div>
                <div className="p-10 flex flex-col flex-1 text-left">
                  <h3 className="text-2xl font-bold mb-4">{room.name}</h3>
                  <p className="text-gray-500 mb-6 flex-1">{room.desc}</p>
                  
                  <div className="flex items-center gap-4 text-gray-400 mb-8 border-t border-gray-100 pt-6">
                    {room.amenities.map((Icon, idx) => <Icon key={idx} className="w-5 h-5 group-hover:text-[#F97316] transition-colors" />)}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                    <div className="text-2xl font-bold text-[#F97316]">${room.price} <span className="text-xs text-gray-400 font-normal">/ night</span></div>
                    <Link to="/book" className="bg-[#F97316] hover:bg-[#EA6C0A] text-white px-6 py-2.5 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group no-underline">
                      Book Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/book" className="inline-flex items-center gap-2 text-[#F97316] font-bold text-lg hover:underline transition-all no-underline">
            View All Rooms <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Membership Banner ─── */}
      <section className="px-8 md:px-16 py-32 bg-[#FDFDFD] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0F172A] rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-xl shadow-slate-900/10">
            <div className="text-white max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-[1.2]">Elevate your stay with Atot Rewards</h2>
              <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                Join our exclusive membership program to unlock up to 30% off, priority upgrades, and complimentary late check-out.
              </p>
              <button className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl font-bold transition-colors">
                Become a Member
              </button>
            </div>
            
            {/* Visual element */}
            <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-white">
                <div className="text-3xl font-bold mb-2">30%</div>
                <div className="text-sm text-orange-100">Member Discount</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-white translate-y-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm text-orange-100">Concierge Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-8 md:px-16 pb-32 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-serif mb-4 text-black">Common Questions</h2>
          <p className="text-gray-500">Everything you need to know about your stay.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {[
            { q: 'How do I book a room at Atot Hotel?', a: 'Booking your luxury stay is seamless. You can use our integrated booking bar at the top of the page to check real-time availability. Simply select your check-in and check-out dates, specify the number of guests, and our system will present you with the best available suites for your stay. You can also contact our concierge for personalized booking assistance.' },
            { q: 'What is your cancellation policy?', a: 'We understand that plans can change. Our flexible booking rates allow for complimentary cancellation or modification up to 24 hours prior to your scheduled arrival. Please note that special promotional rates or non-refundable bookings may have different terms. We recommend reviewing the specific policy associated with your chosen rate during the booking process.' },
            { q: 'Is breakfast included in the room rate?', a: 'A gourmet breakfast experience is one of our hallmarks. We provide a complimentary world-class breakfast buffet for all guests staying in our Presidential Suites and for our Atot Rewards members. For other room categories, an optional breakfast package featuring fresh local ingredients and international specialties can be added to your reservation.' },
            { q: 'What time is check-in and check-out?', a: 'To ensure every suite is perfectly prepared for your arrival, standard check-in begins at 3:00 PM. Our standard check-out time is 11:00 AM. However, we strive to accommodate early arrivals and late departures whenever possible. Atot Rewards members enjoy the exclusive benefit of guaranteed late check-out until 2:00 PM.' },
            { q: 'Do you offer airport pickup?', a: 'Yes, we provide a premium airport transfer service. Our private chauffeur will meet you at the arrivals hall in a luxury vehicle to ensure a smooth transition to the hotel. We recommend arranging this service with our dedicated concierge team at least 48 hours prior to your arrival to guarantee availability.' },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-gray-100 bg-white rounded-lg px-8 py-0.5 data-[state=open]:shadow-lg transition-all">
              <AccordionTrigger className="hover:no-underline text-left py-4 text-black group">
                <span className="font-medium text-base tracking-wide uppercase text-gray-800 transition-colors group-hover:text-[#F97316]">{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed text-sm pb-6 mt-4 border-t border-gray-50 pt-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </div>
  );
};

export default AtotHotel;
