// src/pages/dashboard/hotel/HotelDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CalendarDays, 
  Bed, 
  Users, 
  Plus, 
  LayoutDashboard, 
  Clock, 
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronRight,
  UserCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  LogOut,
  MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadHotelData, saveHotelData } from './hotelStores';
import { Reservation, RoomState, RoomOperationalStatus } from './types';
import { rooms as staticRoomData } from '@/data/roomData';
import './HotelDashboard.css';

// Sub-components
const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <div className="hms-stat-card animate-premium" style={{ color, animationDelay: `${delay}ms` }}>
    <div className="hms-stat-icon" style={{ backgroundColor: `${color}10` }}>
      <Icon size={28} />
    </div>
    <div className="hms-stat-info">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const HotelDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomStates, setRoomStates] = useState<RoomState[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<Partial<Reservation>>({
    guestName: '',
    phone: '',
    roomType: 'Signature Heritage',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
    totalPrice: 0,
  });

  useEffect(() => {
    const { reservations, roomStates } = loadHotelData();
    setReservations(reservations);
    setRoomStates(roomStates);
    
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    saveHotelData(reservations, roomStates);
  }, [reservations, roomStates]);

  const handleStatusChange = (resId: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status } : r));
    
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    if (status === 'CHECKED_IN') {
      const roomId = res.roomId || roomStates.find(rs => 
        staticRoomData.find(rt => rt.id === rs.id)?.type === res.roomType && rs.status === 'AVAILABLE'
      )?.id;

      if (roomId) {
        setRoomStates(prev => prev.map(rs => rs.id === roomId ? { ...rs, status: 'OCCUPIED', currentReservationId: resId } : rs));
        setReservations(prev => prev.map(r => r.id === resId ? { ...r, roomId } : r));
      }
    } else if (status === 'CHECKED_OUT') {
      if (res.roomId) {
        setRoomStates(prev => prev.map(rs => rs.id === res.roomId ? { ...rs, status: 'CLEANING', currentReservationId: undefined } : rs));
      }
    }
  };

  const handleUpdateRoomStatus = (roomId: string, status: RoomOperationalStatus) => {
    setRoomStates(prev => prev.map(rs => rs.id === roomId ? { ...rs, status } : rs));
  };

  const handleManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const resId = `RES-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = 500;
    
    const reservation: Reservation = {
      id: resId,
      guestName: newBooking.guestName || 'Walk-in Guest',
      phone: newBooking.phone || '',
      roomType: newBooking.roomType || 'Signature Heritage',
      checkIn: newBooking.checkIn || '',
      checkOut: newBooking.checkOut || '',
      guests: newBooking.guests || 2,
      totalPrice: total,
      depositPaid: 0,
      amountDue: total,
      status: 'PENDING',
      createdAt: Date.now()
    };

    setReservations(prev => [reservation, ...prev]);
    setIsBookingModalOpen(false);
    setActiveTab('board');
  };

  const upcomingReservations = reservations.filter(r => r.status === 'PENDING');
  const activeReservations = reservations.filter(r => r.status === 'CHECKED_IN');

  const renderSidebar = () => (
    <aside className="hms-sidebar">
      <div className="hms-sidebar-brand">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Bed size={22} />
        </div>
        <div>
          <h2 className="text-white">Atot Grand</h2>
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#FF6B35] uppercase opacity-80">Hospitality HMS</p>
        </div>
      </div>

      <nav className="hms-sidebar-nav">
        {[
          { id: 'board', label: 'Operations Board', icon: LayoutDashboard },
          { id: 'calendar', label: 'Occupancy Map', icon: CalendarDays },
          { id: 'rooms', label: 'Room Inventory', icon: Bed },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`hms-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hms-sidebar-footer">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] border border-[#FF6B35]/30">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Abebe B.</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manager</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-red-400 font-bold text-xs px-6 hover:text-red-300 transition-colors">
          <LogOut size={16} /> Logout System
        </button>
      </div>
    </aside>
  );

  return (
    <div className="hms-root">
      {renderSidebar()}
      
      <main className="hms-main">
        <header className="hms-header animate-premium">
          <div>
            <h1>Dashboard</h1>
            <p>Atot Grand Hospitality Management · {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Clock size={12} className="text-[#FF6B35]" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 relative shadow-sm hover:shadow-md transition-all cursor-pointer">
              <Bell size={22} />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#FF6B35] rounded-full border-2 border-white"></div>
            </div>
            <Button 
              onClick={() => setIsBookingModalOpen(true)}
              className="h-16 px-10 bg-black hover:bg-[#FF6B35] text-white rounded-tl-[2rem] rounded-tr-none rounded-bl-none rounded-br-[2rem] font-bold text-base transition-all shadow-xl shadow-black/5"
            >
              <Plus size={20} className="mr-2" /> New Booking
            </Button>
          </div>
        </header>

        <section className="hms-stats-grid">
          <StatCard title="Today's Arrivals" value={upcomingReservations.length} icon={Clock} color="#FF6B35" delay={100} />
          <StatCard title="Active Stays" value={activeReservations.length} icon={Users} color="#10B981" delay={200} />
          <StatCard title="Cleaning Mode" value={roomStates.filter(r => r.status === 'CLEANING').length} icon={AlertCircle} color="#3B82F6" delay={300} />
          <StatCard title="Total Occupancy" value={`${Math.round((roomStates.filter(r => r.status === 'OCCUPIED').length / staticRoomData.length) * 100)}%`} icon={BarChart3} color="#8B5CF6" delay={400} />
        </section>

        {activeTab === 'board' && (
          <div className="hms-board animate-premium" style={{ animationDelay: '500ms' }}>
            <div className="hms-column">
              <div className="hms-column-header">
                <span className="hms-column-title">Expected Arrivals</span>
                <Badge variant="outline" className="text-[#FF6B35] border-[#FF6B35]/20 bg-[#FF6B35]/5 font-bold">{upcomingReservations.length}</Badge>
              </div>
              <div className="space-y-6">
                {upcomingReservations.map(res => (
                  <div key={res.id} className="hms-res-card group">
                    <div className="flex justify-between items-start mb-6">
                      <h4>{res.guestName}</h4>
                      <button className="text-gray-300 group-hover:text-black transition-colors"><MoreVertical size={18} /></button>
                    </div>
                    <div className="hms-res-meta">
                      <div className="hms-meta-item"><CalendarDays size={14} className="text-[#FF6B35]" /> {res.checkIn}</div>
                      <div className="hms-meta-item"><Users size={14} className="text-[#FF6B35]" /> {res.guests} Pax · {res.roomType}</div>
                    </div>
                    <div className="hms-res-footer">
                      <span className="text-[10px] font-bold text-gray-400">#{res.id}</span>
                      <button 
                        onClick={() => handleStatusChange(res.id, 'CHECKED_IN')}
                        className="h-10 px-6 rounded-full bg-black text-white font-bold text-[10px] hover:bg-[#FF6B35] transition-all flex items-center gap-2"
                      >
                        Check-in Now <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingReservations.length === 0 && (
                  <div className="py-32 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <Clock size={32} />
                    </div>
                    <p className="text-gray-300 text-sm font-bold uppercase tracking-widest italic">No arrivals expected</p>
                  </div>
                )}
              </div>
            </div>

            <div className="hms-column">
              <div className="hms-column-header">
                <span className="hms-column-title">In-House Guests</span>
                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 font-bold">{activeReservations.length}</Badge>
              </div>
              <div className="space-y-6">
                {activeReservations.map(res => (
                  <div key={res.id} className="hms-res-card border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-6">
                      <h4>{res.guestName}</h4>
                      <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px] py-1 px-3">ROOM {res.roomId?.split('-').pop()?.toUpperCase() || '---'}</Badge>
                    </div>
                    <div className="hms-res-meta">
                      <div className="hms-meta-item text-orange-500 font-bold"><Clock size={14} /> Departure: {res.checkOut}</div>
                    </div>
                    <button 
                      onClick={() => handleStatusChange(res.id, 'CHECKED_OUT')}
                      className="w-full h-12 rounded-2xl bg-gray-50 text-gray-600 font-bold text-[11px] hover:bg-black hover:text-white transition-all mt-6 uppercase tracking-widest"
                    >
                      Process Check-out
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="hms-column">
              <div className="hms-column-header">
                <span className="hms-column-title">Financial Performance</span>
              </div>
              <div className="space-y-8">
                <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-black/[0.02] text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="font-bold text-2xl font-serif">Service Integrity</h4>
                  <p className="text-sm text-gray-400 font-medium">All systems operational. Daily health check completed at 06:00 AM.</p>
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-gray-200 text-gray-600 hover:bg-[#FF6B35] hover:text-white hover:border-none transition-all">Audit System Logs</Button>
                </div>
                
                <div className="p-10 rounded-[2.5rem] bg-[#1A1A1A] text-white text-center space-y-4 shadow-2xl shadow-black/20 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B35]"></div>
                   <h4 className="font-bold text-lg opacity-60">Daily Revenue</h4>
                   <div className="text-4xl font-bold tracking-tighter">$12,450.00</div>
                   <p className="text-[10px] text-[#FF6B35] uppercase font-bold tracking-[0.2em] pt-4">Target: $15,000</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="animate-premium" style={{ animationDelay: '200ms' }}>
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold font-serif">Inventory Control</h2>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#10B981] bg-green-50 px-4 py-2 rounded-full border border-green-100">● Available</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] bg-orange-50 px-4 py-2 rounded-full border border-orange-100">● Occupied</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] bg-blue-50 px-4 py-2 rounded-full border border-blue-100">● Cleaning</div>
                </div>
             </div>
             
             <div className="hms-room-grid">
                {staticRoomData.map(room => {
                  const state = roomStates.find(s => s.id === room.id);
                  return (
                    <div key={room.id} className={`hms-room-card status-${state?.status.toLowerCase()}`}>
                       <h4>{room.id.split('-').pop()?.toUpperCase()}</h4>
                       <p className="type">{room.type}</p>
                       <div className="h-px bg-gray-50 mb-8"></div>
                       <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                             <span style={{ color: `var(--status-${state?.status.toLowerCase()})` }}>{state?.status}</span>
                             <button className="text-gray-300 hover:text-black"><SettingsIcon size={16} /></button>
                          </div>
                          <div className="hms-room-actions">
                             <button onClick={() => handleUpdateRoomStatus(room.id, 'AVAILABLE')} className="hms-action-btn">Ava</button>
                             <button onClick={() => handleUpdateRoomStatus(room.id, 'CLEANING')} className="hms-action-btn">Cln</button>
                             <button onClick={() => handleUpdateRoomStatus(room.id, 'MAINTENANCE')} className="hms-action-btn">Fix</button>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-premium">
            <div className="hms-calendar-wrapper">
              <table className="hms-calendar-table w-full">
                <thead>
                  <tr>
                    <th className="p-6 text-left w-56">Heritage Unit</th>
                    {Array.from({ length: 14 }).map((_, i) => (
                      <th key={i} className={`text-center ${i === 0 ? 'today' : ''}`}>
                        <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() + i) % 7]}</div>
                        <span className="date">{new Date(new Date().setDate(new Date().getDate() + i)).getDate()}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staticRoomData.slice(0, 8).map(room => (
                    <tr key={room.id} className="border-t border-gray-50">
                      <td className="p-8">
                        <div className="font-bold text-sm text-gray-800">{room.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">RM-{room.id.split('-')[1]}</div>
                      </td>
                      <td colSpan={14} className="p-4 relative">
                         {Math.random() > 0.4 && (
                           <div className="hms-booking-bar absolute h-12 top-6 bg-[#FF6B35] rounded-xl flex items-center px-6 text-white text-[10px] font-bold shadow-lg shadow-orange-500/10 cursor-pointer hover:scale-[1.01] transition-all" style={{ left: `${Math.random() * 40}%`, width: `${20 + Math.random() * 30}%` }}>
                              <CheckCircle2 size={12} className="mr-2" /> {reservations[0]?.guestName || 'VIP Guest'} · Occupying
                           </div>
                         )}
                         <div className="grid grid-cols-14 gap-2">
                            {Array.from({ length: 14 }).map((_, i) => (
                              <div key={i} className="h-20 bg-gray-50/50 rounded-xl"></div>
                            ))}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Manual Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-14 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                 <div>
                    <h2 className="text-4xl font-bold font-serif text-[#1A1A1A]">Luxury Reservation</h2>
                    <p className="text-gray-400 text-sm font-medium mt-2">Initialize a manual booking for our esteemed guests.</p>
                 </div>
                 <button onClick={() => setIsBookingModalOpen(false)} className="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:rotate-180 transition-all duration-500 shadow-sm">
                    <Plus className="rotate-45" size={28} />
                 </button>
              </div>
              
              <form onSubmit={handleManualBooking} className="p-14 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[11px] font-bold uppercase text-[#FF6B35] tracking-[0.2em] ml-2">Guest Identity</label>
                       <div className="relative">
                          <UserCircle size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input 
                            required 
                            className="w-full h-16 pl-16 pr-6 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#FF6B35] border-2 outline-none font-bold text-gray-800 transition-all" 
                            placeholder="Full Name"
                            value={newBooking.guestName}
                            onChange={e => setNewBooking(prev => ({ ...prev, guestName: e.target.value }))}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-bold uppercase text-[#FF6B35] tracking-[0.2em] ml-2">Secure Contact</label>
                       <input 
                         required 
                         className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#FF6B35] border-2 outline-none font-bold text-gray-800 transition-all" 
                         placeholder="+251 9xx xxx xxx"
                         value={newBooking.phone}
                         onChange={e => setNewBooking(prev => ({ ...prev, phone: e.target.value }))}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[11px] font-bold uppercase text-gray-400 tracking-[0.2em] ml-2">Arrival Schedule</label>
                       <input 
                         type="date"
                         required 
                         className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-transparent outline-none font-bold text-gray-800" 
                         value={newBooking.checkIn}
                         onChange={e => setNewBooking(prev => ({ ...prev, checkIn: e.target.value }))}
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-bold uppercase text-gray-400 tracking-[0.2em] ml-2">Departure Schedule</label>
                       <input 
                         type="date"
                         required 
                         className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-transparent outline-none font-bold text-gray-800" 
                         value={newBooking.checkOut}
                         onChange={e => setNewBooking(prev => ({ ...prev, checkOut: e.target.value }))}
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase text-gray-400 tracking-[0.2em] ml-2">Atot Suite Selection</label>
                    <select 
                      className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-transparent outline-none font-bold text-gray-800 appearance-none cursor-pointer"
                      value={newBooking.roomType}
                      onChange={e => setNewBooking(prev => ({ ...prev, roomType: e.target.value }))}
                    >
                      <option>Royal Elite</option>
                      <option>Signature Heritage</option>
                      <option>Executive Residency</option>
                      <option>Classic Hospitality</option>
                    </select>
                 </div>

                 <div className="pt-6">
                    <Button type="submit" className="w-full h-20 bg-black hover:bg-[#FF6B35] text-white rounded-tl-[2.5rem] rounded-tr-none rounded-bl-none rounded-br-[2.5rem] font-bold text-xl transition-all shadow-2xl shadow-black/10 group">
                       Initialize Stay <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default HotelDashboard;
