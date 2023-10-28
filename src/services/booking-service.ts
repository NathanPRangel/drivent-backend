import { TicketStatus } from '@prisma/client';
import { cannotBookError, conflictError, notFoundError } from '@/errors';
import { bookingRepository, enrollmentRepository, hotelRepository, roomRepository, ticketsRepository } from '@/repositories';
import redis from '@/config/redis';
import redisUtils from '@/utils/redis-utils';

async function validateUserBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw cannotBookError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw cannotBookError();
  }

  const userBooking = await bookingRepository.findByUserId(userId);
  if(userBooking) throw conflictError('Booking')
}

async function checkValidBooking(roomId: number) {
  const room = await roomRepository.findById(roomId);
  if (!room) throw notFoundError();

  const bookings = await bookingRepository.findByRoomId(roomId);
  if (room.capacity <= bookings.length) throw cannotBookError();
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function bookRoomById(userId: number, roomId: number) {
  await validateUserBooking(userId);
  await checkValidBooking(roomId);

  const createdBooking = await bookingRepository.create({ roomId, userId });

  const room = await roomRepository.findById(roomId);
  await redisUtils.resetHotels(room.Hotel.id);

  return createdBooking;
}

async function changeBookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw notFoundError();

  await checkValidBooking(roomId);
  const booking = await bookingRepository.findByUserId(userId);

  if (!booking || booking.userId !== userId) throw cannotBookError();

  await redisUtils.resetHotels(booking.Room.Hotel.id);

  return bookingRepository.upsertBooking({
    id: booking.id,
    roomId,
    userId,
  });
}

export const bookingService = {
  bookRoomById,
  getBooking,
  changeBookingRoomById,
};
