import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock,
  Users, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  ChevronRight,
  ShieldCheck,
  Download,
  FileDown,
  Home,
  Copy,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Room, rooms } from '../data/roomData';
import { initializeChapaPayment, generateTxRef } from '@/lib/chapaService';
import Footer from '../components/Footer';

interface BookingData {
  fullName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
}

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    fullName: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    specialRequests: ''
  });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('price-low');
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'arrival'>('now');
  const [reservationId, setReservationId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [paidDeposit, setPaidDeposit] = useState(false);

  // Dates for validation
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    // Check for success redirect from Chapa
    const status = searchParams.get('status');
    if (status === 'success') {
      const storedData = localStorage.getItem('atot_pending_booking');
      if (storedData) {
        try {
          const { data, room, id, paidDeposit: wasDeposit } = JSON.parse(storedData);
          setBookingData(data);
          setSelectedRoom(room);
          setReservationId(id || `RES-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
          setPaidDeposit(wasDeposit || false);
          setPaymentMethod(wasDeposit ? 'arrival' : 'now');
          localStorage.removeItem('atot_pending_booking');
        } catch (e) {
          console.error("Failed to restore booking data", e);
        }
      }
      setIsProcessing(false);
      setStep(4);
      
      // Clean up URL parameters without full page reload
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Remove all non-numeric characters
      let numericValue = value.replace(/\D/g, '');
      
      // Remove leading 0 if present
      if (numericValue.startsWith('0')) {
        numericValue = numericValue.substring(1);
      }

      // Limit to 9 digits
      numericValue = numericValue.substring(0, 9);

      // Validate first digit (must be 9 or 7)
      if (numericValue.length > 0) {
        if (!['7', '9'].includes(numericValue[0])) {
          setPhoneError('Number must start with 9 or 7');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }

      setBookingData(prev => ({ ...prev, phone: numericValue }));
      return;
    }

    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!bookingData.fullName || !bookingData.phone || !bookingData.checkIn || !bookingData.checkOut) {
        toast.error("Please fill in all required fields.");
        return;
      }
      
      if (phoneError || bookingData.phone.length !== 9) {
        toast.error("Please enter a valid 9-digit phone number starting with 9 or 7.");
        return;
      }

      if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
        toast.error("Check-out date must be after check-in date.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedRoom) {
        toast.error("Please select a room to continue.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setIsProcessing(true);
      
      const handleChapa = async (isDeposit: boolean) => {
        try {
          const txRef = generateTxRef();
          const resId = `RES-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const amount = isDeposit ? calculateDeposit() : calculateTotal();
          
          // Persist data before redirect
          localStorage.setItem('atot_pending_booking', JSON.stringify({
            data: bookingData,
            room: selectedRoom,
            id: resId,
            paidDeposit: isDeposit
          }));

          const result = await initializeChapaPayment({
            customer: {
              firstName: bookingData.fullName.split(' ')[0] || 'Guest',
              lastName: bookingData.fullName.split(' ').slice(1).join(' ') || 'Customer',
              email: 'hotel-guest@gmail.com',
              phone: `+251${bookingData.phone}`
            },
            amount: amount,
            orderItems: [{
              name: selectedRoom?.name ? (isDeposit ? `${selectedRoom.name} (30% Deposit)` : selectedRoom.name) : 'Hotel Stay',
              qty: calculateNights(),
              price: isDeposit ? (selectedRoom?.price || 0) * 0.3 : (selectedRoom?.price || 0)
            }],
            callbackUrl: `${window.location.origin}/book?status=success`
          });
          
          window.location.href = result.checkout_url;
        } catch (error) {
          console.error(error);
          toast.error("Failed to initialize payment. Please try again.");
          setIsProcessing(false);
        }
      };

      handleChapa(paymentMethod === 'arrival');
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDeposit = () => {
    return calculateTotal() * 0.3;
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    const subtotal = selectedRoom.price * nights;
    const taxes = subtotal * 0.1;
    return subtotal + taxes;
  };

  const filteredRooms = rooms
    .filter(r => filterType === 'All' || r.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const renderStepIndicator = () => (
    <div className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
        {[
          { num: 1, label: 'Guest Info' },
          { num: 2, label: 'Available Rooms' },
          { num: 3, label: 'Review & Confirm' },
          { num: 4, label: 'Confirmation' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-3">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num >= step}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
                step === s.num 
                  ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-500/20 scale-110' 
                  : step > s.num 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white text-gray-400 border-gray-100'
              }`}
            >
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </button>
            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${step === s.num ? 'text-black' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 p-8 md:p-10">
          <CardTitle className="text-3xl font-serif text-black">Plan Your Stay</CardTitle>
          <CardDescription className="text-gray-500 text-lg font-light">Enter your details and travel dates to find the perfect suite.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</Label>
              <Input 
                name="fullName" 
                value={bookingData.fullName} 
                onChange={handleInputChange}
                placeholder="John Doe" 
                className="rounded-xl border-gray-100 h-12 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-3 border-gray-100">+251</div>
                <Input 
                  name="phone" 
                  type="tel" 
                  value={bookingData.phone} 
                  onChange={handleInputChange}
                  placeholder="9xx xxx xxx" 
                  className={`rounded-xl border-gray-100 h-12 bg-gray-50/50 focus:bg-white transition-all pl-20 ${phoneError ? 'border-red-300 focus:border-red-400' : ''}`}
                />
              </div>
              {phoneError && <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1">{phoneError}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Check-in Date</Label>
              <Input 
                name="checkIn" 
                type="date" 
                min={today}
                value={bookingData.checkIn} 
                onChange={handleInputChange}
                className="rounded-xl border-gray-100 h-12 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Check-out Date</Label>
              <Input 
                name="checkOut" 
                type="date" 
                min={bookingData.checkIn ? new Date(new Date(bookingData.checkIn).setDate(new Date(bookingData.checkIn).getDate() + 1)).toISOString().split('T')[0] : tomorrow}
                value={bookingData.checkOut} 
                onChange={handleInputChange}
                className="rounded-xl border-gray-100 h-12 bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Number of Guests</Label>
            <div className="flex items-center gap-4">
              <Input 
                name="guests" 
                type="number" 
                min="1" 
                max="6"
                value={bookingData.guests} 
                onChange={handleInputChange}
                className="rounded-xl border-gray-100 h-12 bg-gray-50/50 focus:bg-white transition-all w-24"
              />
              <span className="text-sm text-gray-400 italic">Up to 6 guests per booking.</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Special Requests (Optional)</Label>
            <Textarea 
              name="specialRequests" 
              value={bookingData.specialRequests} 
              onChange={handleInputChange}
              placeholder="Any special requests? Early check-in, extra bed, etc." 
              className="rounded-xl border-gray-100 min-h-[120px] bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>
        </CardContent>
        <CardFooter className="p-8 md:p-10 pt-0 flex flex-col gap-4">
          <Button 
            onClick={handleNextStep}
            className="w-full h-14 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl font-bold text-lg pointer-events-auto"
          >
            Check Available Rooms <ArrowRight size={20} className="ml-2" />
          </Button>
          <p className="text-center text-xs text-gray-400">
            No account needed. We'll send your confirmation to your phone.
          </p>
        </CardFooter>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-2">Select Your Suite</h2>
          <p className="text-gray-500">
            {bookingData.checkIn} <ArrowRight size={14} className="inline mx-2" /> {bookingData.checkOut} • {calculateNights()} Nights • {bookingData.guests} Guests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[220px] rounded-xl border-gray-200">
              <SelectValue placeholder="Room Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Collections</SelectItem>
              <SelectItem value="Royal Elite">Royal Elite Collection</SelectItem>
              <SelectItem value="Signature Heritage">Signature Heritage</SelectItem>
              <SelectItem value="Executive Residency">Executive Residency</SelectItem>
              <SelectItem value="Classic Hospitality">Classic Hospitality</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-xl border-gray-200">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-20 pb-32">
        {['Royal Elite', 'Signature Heritage', 'Executive Residency', 'Classic Hospitality']
          .filter(tier => filterType === 'All' || filterType === tier)
          .map((tier) => {
            const roomsInTier = filteredRooms.filter(r => r.type === tier);
            if (roomsInTier.length === 0) return null;

            return (
              <div key={tier} className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">{tier}</h3>
                  <div className="h-px w-full bg-gray-100"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {roomsInTier.map((room) => (
                    <div 
                      key={room.id} 
                      className={`flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${selectedRoom?.id === room.id ? 'border-[#F97316]' : 'border-transparent'}`}
                    >
                      <div className="relative aspect-video">
                        <img src={room.img} alt={room.name} className="w-full h-full object-cover" />
                        <Badge className="absolute top-4 left-4 bg-[#F97316] text-white border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">{room.type}</Badge>
                      </div>
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div>
                          <h3 className="text-xl font-bold">{room.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{room.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          {room.amenities.map((Icon: any, idx: number) => <Icon key={idx} size={14} />)}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Up to {room.maxGuests} guests</div>
                        <div className="pt-4 border-t border-gray-50 mt-auto">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-sm text-gray-400">Per Night</div>
                              <div className="text-2xl font-bold text-black">${room.price}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Total</div>
                              <div className="text-lg font-bold text-[#F97316]">${room.price * calculateNights()}</div>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => { setSelectedRoom(room); setStep(3); }}
                          className="w-full bg-black hover:bg-[#F97316] text-white rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-xl mt-4 h-12 font-bold transition-all hover:scale-[1.02]"
                        >
                          Select This Suite
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        {filteredRooms.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-bold">No rooms available</h3>
            <p className="text-gray-500">Try adjusting your filters or dates to find your perfect stay.</p>
            <Button variant="outline" onClick={() => { setFilterType('All'); setSortBy('price-low'); }}>Clear All Filters</Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Summary */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-serif">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={selectedRoom?.img} alt={selectedRoom?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <Badge variant="outline" className="text-[#F97316] border-[#F97316] mb-1">{selectedRoom?.type}</Badge>
                  <h3 className="text-lg font-bold">{selectedRoom?.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-tighter">Luxury Guest Suite</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm pt-4 border-t border-gray-50">
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Check-in</div>
                  <div className="font-bold flex items-center gap-2"><Calendar size={14} className="text-[#F97316]" /> {bookingData.checkIn}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Check-out</div>
                  <div className="font-bold flex items-center gap-2"><Calendar size={14} className="text-[#F97316]" /> {bookingData.checkOut}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Duration</div>
                  <div className="font-bold">{calculateNights()} Nights</div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Guests</div>
                  <div className="font-bold">{bookingData.guests} Adults</div>
                </div>
              </div>

              {bookingData.specialRequests && (
                <div className="pt-4 border-t border-gray-50">
                  <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Special Requests</div>
                  <p className="text-sm italic text-gray-600">"{bookingData.specialRequests}"</p>
                </div>
              )}

              <div className="pt-6 border-t border-black space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Room rate (${selectedRoom?.price}/night)</span>
                  <span className="font-bold">${selectedRoom?.price! * calculateNights()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 group relative">
                    <span className="text-gray-500 border-b border-dotted border-gray-400 cursor-help">Taxes & Fees (10%)</span>
                    <Info size={12} className="text-gray-400" />
                  </div>
                  <span className="font-bold">${(selectedRoom?.price! * calculateNights() * 0.1).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-xl font-serif font-bold">Total Amount</span>
                  <span className="text-3xl font-bold text-[#F97316]">${calculateTotal().toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-serif">Guest Details</CardTitle>
                <button onClick={() => setStep(1)} className="text-[#F97316] text-sm font-bold hover:underline">Edit</button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F97316]">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guest Name</div>
                  <div className="font-bold">{bookingData.fullName}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F97316]">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</div>
                  <div className="font-bold">{bookingData.phone}</div>
                </div>
              </div>
            </CardContent>
            
            <div className="h-px bg-gray-100 mx-8"></div>
            
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-serif">Review & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-10 space-y-8">
              <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 space-y-4">
                <div className="flex items-center gap-3 text-orange-800">
                  <ShieldCheck size={20} />
                  <span className="font-bold text-sm">Identity Verification Required</span>
                </div>
                <p className="text-xs text-orange-700 leading-relaxed">
                  To ensure a secure stay, please bring a valid <span className="font-bold">Passport, Fayda ID, or Driver's License</span> to prove your identity upon check-in.
                </p>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-4">
                <div className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'now' ? 'border-[#F97316] bg-orange-50/10' : 'border-gray-100'}`} onClick={() => setPaymentMethod('now')}>
                  <RadioGroupItem value="now" id="now" />
                  <div className="flex-1">
                    <Label htmlFor="now" className="text-lg font-bold cursor-pointer">Full Payment Now</Label>
                    <p className="text-sm text-gray-500">Pay 100% and enjoy a faster check-in.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${calculateTotal().toFixed(0)}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Total Due</div>
                  </div>
                </div>
                <div className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'arrival' ? 'border-[#F97316] bg-orange-50/10' : 'border-gray-100'}`} onClick={() => setPaymentMethod('arrival')}>
                  <RadioGroupItem value="arrival" id="arrival" />
                  <div className="flex-1">
                    <Label htmlFor="arrival" className="text-lg font-bold cursor-pointer">30% Deposit Now</Label>
                    <p className="text-sm text-gray-500">Secure your room and pay the rest at arrival.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${calculateDeposit().toFixed(0)}</div>
                    <div className="text-[10px] text-orange-500 font-bold uppercase">Deposit</div>
                  </div>
                </div>
              </RadioGroup>

              <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-blue-900">Final Review</h4>
                  <p className="text-sm text-blue-700 font-light leading-relaxed">
                    You are paying <span className="font-bold">${paymentMethod === 'now' ? calculateTotal().toFixed(0) : calculateDeposit().toFixed(0)}</span> today. 
                    {paymentMethod === 'arrival' && ` The remaining $${(calculateTotal() - calculateDeposit()).toFixed(0)} will be due upon check-in.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl text-[10px] md:text-xs text-gray-500 leading-relaxed italic border border-gray-100">
                <Info size={16} className="text-[#F97316] flex-shrink-0" />
                <span>Free cancellation up to 48 hours before check-in. After that, the deposit or 1 night will be charged.</span>
              </div>

              <Button 
                onClick={handleNextStep}
                className="w-full h-16 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-tl-3xl rounded-tr-none rounded-bl-none rounded-br-3xl font-bold text-xl shadow-lg shadow-orange-500/20 group overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center">
                  Proceed to Secure Checkout <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-1000">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border border-green-100 text-green-600 mb-8 shadow-2xl shadow-green-100/50">
          <CheckCircle2 size={48} strokeWidth={2} />
        </div>
        <h2 className="text-5xl md:text-6xl font-serif text-black font-medium tracking-tight">Reservation Secured</h2>
        <p className="text-gray-500 text-xl font-light max-w-xl mx-auto leading-relaxed">
          Welcome to the world of Atot. Your sanctuary is prepared, and every detail has been refined for your arrival.
        </p>
      </div>

      {/* ─── Luxury Digital Receipt ─── */}
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-100/20 to-green-100/20 rounded-[3rem] blur-2xl group-hover:opacity-75 transition duration-1000"></div>
        
        <Card className="border-none shadow-[0_40px_80px_rgba(0,0,0,0.06)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-2xl relative z-10">
          {/* Decorative Ticket Notches */}
          <div className="absolute left-0 top-[45%] -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-r-full border-y border-r border-gray-100 shadow-inner"></div>
          <div className="absolute right-0 top-[45%] -translate-y-1/2 w-6 h-12 bg-gray-50 rounded-l-full border-y border-l border-gray-100 shadow-inner"></div>
          
          <CardContent className="p-0">
            {/* Top Section (Branding & Status) */}
            <div className="p-10 md:p-14 border-b border-dashed border-gray-200 relative">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500">Official Receipt</p>
                  <p className="text-2xl font-mono font-medium tracking-tighter text-black uppercase">{reservationId}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500 text-white border-none px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/20">
                    Confirmed
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Date</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Guest</p>
                  <p className="text-sm font-medium line-clamp-1">{bookingData.fullName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Method</p>
                  <p className="text-sm font-medium">{paidDeposit ? '30% Deposit Paid' : 'Full Payment Paid'}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Reference</p>
                  <p className="text-sm font-medium font-mono text-orange-500 uppercase">{paidDeposit ? 'DEP-' : 'FUL-'}{Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Middle Section (Stay Details) */}
            <div className="p-10 md:p-14 grid md:grid-cols-2 gap-16 bg-gray-50/30">
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#F97316]">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Check-in</p>
                    <p className="text-xl font-bold">{bookingData.checkIn}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">Starts after 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#F97316]">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Check-out</p>
                    <p className="text-xl font-bold">{bookingData.checkOut}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">Before 11:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                    <img src={selectedRoom?.img} alt={selectedRoom?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedRoom?.name}</h4>
                    <p className="text-xs text-gray-400 font-light">{selectedRoom?.type} • {calculateNights()} Nights</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {paidDeposit ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Deposit Paid</span>
                        <span className="font-bold text-green-600">${calculateDeposit().toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Due at Arrival</span>
                        <span className="font-bold text-orange-600">${(calculateTotal() - calculateDeposit()).toFixed(0)}</span>
                      </div>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Total Investment</span>
                        <div className="text-2xl font-bold text-black">
                          <span className="text-sm font-light text-gray-300 mr-1">$</span>
                          {calculateTotal().toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center md:text-right space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Total Investment Paid</p>
                      <div className="text-4xl font-bold text-black flex items-center justify-center md:justify-end">
                        <span className="text-xl font-light text-gray-300 mr-2">$</span>
                        {calculateTotal().toFixed(0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="p-10 md:p-14 flex flex-col sm:flex-row gap-6 justify-center items-center bg-white">
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="w-full sm:w-auto px-8 h-14 rounded-2xl border-gray-100 bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-3"
              >
                <FileDown size={18} /> Download Receipt
              </Button>
              <Button 
                onClick={() => window.location.href = '/hotel'}
                className="w-full sm:w-auto px-12 h-14 rounded-2xl bg-black text-white hover:bg-[#F97316] transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/10"
              >
                <Home size={18} /> Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8">
        <p className="text-sm text-gray-400 font-light italic leading-loose">
          Experience the pinnacle of hospitality. 
          <br/>Your dedicated butler will be awaiting your arrival at the Atot Grand Lobby.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      {/* ─── Header ─── */}
      <nav className="h-24 flex items-center justify-between px-8 md:px-16 border-b border-gray-50 bg-white/50 backdrop-blur-md sticky top-0 z-[1000]">
        <Link to="/hotel" className="flex items-center gap-1 no-underline group">
          <ArrowLeft size={18} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-[#F97316] transition-all" />
          <span className="text-2xl font-bold tracking-tighter text-black">Atot Hotel</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-1.5"></div>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <ShieldCheck size={14} className="text-green-500" /> Secure 256-bit SSL Encryption
        </div>
      </nav>

      <div className="pt-16 px-8 md:px-16">
        {renderStepIndicator()}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[10000] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-[#F97316]/10 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-serif font-bold text-black">Redirecting to Chapa</h2>
            <p className="text-gray-500 max-w-xs mx-auto">Please do not refresh the page. We are securing your transaction via Chapa's 256-bit gateway.</p>
          </div>
          <div className="flex items-center gap-4 pt-12">
            <div className="h-0.5 w-16 bg-gray-100"></div>
            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Atot Secure Checkout</div>
            <div className="h-0.5 w-16 bg-gray-100"></div>
          </div>
        </div>
      )}

      {step < 4 && !isProcessing && <Footer />}
    </div>
  );
};

export default BookingPage;
