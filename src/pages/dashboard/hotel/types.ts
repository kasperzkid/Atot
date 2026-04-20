// src/pages/dashboard/hotel/types.ts

export type ReservationStatus = 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  roomId?: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  depositPaid: number;
  amountDue: number;
  status: ReservationStatus;
  createdAt: number;
  identityProof?: string; // Type of ID: Passport, Fayda, etc.
}

export type RoomOperationalStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

export interface RoomState {
  id: string; // matches room id in roomData
  status: RoomOperationalStatus;
  currentReservationId?: string;
  lastCleaned?: number;
}

export interface HotelState {
  reservations: Reservation[];
  rooms: RoomState[];
}
