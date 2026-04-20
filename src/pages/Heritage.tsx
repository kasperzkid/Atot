import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  Award, 
  Compass, 
  Leaf, 
  Users,
  Star,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Footer from '../components/Footer';

const Heritage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#0A0A0A] font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* ─── Immersive Hero ─── */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000" 
            alt="Atot Hotel Architecture" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center text-white space-y-6 px-8">
          <Link to="/hotel" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Hotel
          </Link>
          <Badge className="bg-[#F97316] text-white border-none px-6 py-2 font-bold uppercase tracking-[0.2em] text-xs">EST. 2011</Badge>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold font-serif tracking-tighter leading-none">
            Heritage & <br/> <span className="italic font-normal">Hospitality</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 font-light leading-relaxed">
            For over 15 years, Atot Hotel has been a beacon of luxury, blending traditional warmth with modern architectural brilliance.
          </p>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-px h-12 bg-white mx-auto"></div>
        </div>
      </section>

      {/* ─── The Story ─── */}
      <section className="px-8 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-100 text-[#F97316] font-bold px-4 py-1 border-none uppercase tracking-widest text-[10px]">The Beginning</Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-black leading-tight">Built on a Vision of Excellence</h2>
            </div>
            <p className="text-lg text-gray-500 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-black">
              It started in 2011 as a bold dream: to create a destination that didn't just provide a room, but offered a portal into a world of refined elegance. Our founders envisioned a place where hospitality was treated as a fine art, practiced daily with passion and precision.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              Through the years, Atot has evolved from a boutique concept into a multi-award winning 5-star institution, never losing sight of the personal connections that make a stay truly memorable.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2 border-l-2 border-[#F97316] pl-6">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Years of History</div>
              </div>
              <div className="space-y-2 border-l-2 border-[#F97316] pl-6">
                <div className="text-3xl font-bold">250k</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Guests Served</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200" 
                alt="Atot Hotel Architecture" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-50/50 -z-10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="bg-slate-900 py-32 text-white">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center space-y-6 mb-24">
            <Badge className="bg-white/10 text-orange-200 border-none px-4 py-1 uppercase tracking-widest text-[10px]">Milestones</Badge>
            <h2 className="text-4xl md:text-6xl font-bold font-serif">A Journey Through Time</h2>
          </div>

          <div className="space-y-16">
            {[
              { year: '2011', title: 'The Foundation', desc: 'The architectural plans for Atot Hotel are finalized, merging sustainable materials with modern design.' },
              { year: '2014', title: 'The Grand Opening', desc: 'Atot opens its doors as a boutique luxury destination, immediately setting new standards for the region.' },
              { year: '2018', title: 'Presidential Launch', desc: 'Expansion of the East Wing, introducing the now-famous Presidential Suites.' },
              { year: '2023', title: '5-Star Certification', desc: 'Officially recognized as a premier 5-star institution by international hospitality boards.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 items-start group">
                <div className="text-5xl md:text-7xl font-bold font-serif text-[#F97316]/50 group-hover:text-[#F97316] transition-colors">{item.year}</div>
                <div className="pt-2 md:pt-6 space-y-3">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {item.title} <ChevronRight size={20} className="text-[#F97316] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </h3>
                  <p className="text-gray-400 max-w-xl text-lg font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="px-8 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Leaf, title: 'Sustainability', desc: 'Every brick and beam honors our commitment to the environment and the local community.' },
            { icon: Award, title: 'Craftsmanship', desc: 'From the hand-carved decor to the bespoke furniture, we celebrate local artisans.' },
            { icon: Compass, title: 'Bespoke Service', desc: 'We believe in personalized experiences that cater to the unique soul of every traveler.' },
          ].map((item, i) => (
            <div key={i} className="space-y-6 p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 group border border-transparent hover:border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-white text-[#F97316] flex items-center justify-center shadow-sm group-hover:bg-[#F97316] group-hover:text-white transition-colors duration-500">
                <item.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-black">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="px-8 md:px-16 py-32 text-center bg-orange-50/30">
        <div className="max-w-3xl mx-auto space-y-10">
          <Star className="mx-auto text-[#F97316] w-12 h-12 fill-[#F97316]" />
          <h2 className="text-4xl md:text-6xl font-bold font-serif">Be Part of the Story</h2>
          <p className="text-xl text-gray-500 font-light">Book your stay today and experience the legacy for yourself.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <Link to="/book" className="bg-[#F97316] text-white px-10 py-5 rounded-tl-2xl rounded-br-2xl font-bold hover:bg-[#EA6C0A] transition-all hover:scale-105 no-underline">
              Book Your Suite
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Heritage;
