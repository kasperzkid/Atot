// src/pages/dashboard/hotel/hotelStores.ts
import { rooms } from '@/data/roomData';
import { Reservation, RoomState, RoomOperationalStatus } from './types';

const RESERVATIONS_KEY = 'atot_hms_reservations';
const ROOMS_KEY = 'atot_hms_rooms';

export const getInitialRoomStates = (): RoomState[] => {
  return rooms.map(room => ({
    id: room.id,
    status: 'AVAILABLE',
  }));
};

export const loadHotelData = () => {
  try {
    const savedReservations = localStorage.getItem(RESERVATIONS_KEY);
    const savedRooms = localStorage.getItem(ROOMS_KEY);
    
    // Also check for legacy front-end bookings from BookingPage.tsx
    const pendingBooking = localStorage.getItem('atot_pending_booking');
    
    let reservations: Reservation[] = savedReservations ? JSON.parse(savedReservations) : [];
    let roomStates: RoomState[] = savedRooms ? JSON.parse(savedRooms) : getInitialRoomStates();

    // If there's a pending booking that just finished (from redirect) but hasn't been ingested
    // This is a simplified simulation of ingestion
    if (pendingBooking) {
      try {
        const { data, room, id, paidDeposit } = JSON.parse(pendingBooking);
        const subtotal = room.price * 2; // Default 2 nights if not calc
        const total = subtotal * 1.1;
        
        const newRes: Reservation = {
          id: id || `RES-${Date.now()}`,
          guestName: data.fullName,
          phone: data.phone,
          roomType: room.type,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          totalPrice: total,
          depositPaid: paidDeposit ? total * 0.3 : total,
          amountDue: paidDeposit ? total * 0.7 : 0,
          status: 'PENDING',
          createdAt: Date.now()
        };
        
        // Add if not exists
        if (!reservations.find(r => r.id === newRes.id)) {
          reservations.unshift(newRes);
          localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
        }
        // Note: We don't remove atot_pending_booking here as BookingPage handles its own cleanup
      } catch (e) {}
    }

    return { reservations, roomStates };
  } catch (e) {
    console.error("Failed to load hotel data", e);
    return { reservations: [], roomStates: getInitialRoomStates() };
  }
};

export const saveHotelData = (reservations: Reservation[], rooms: RoomState[]) => {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
};
