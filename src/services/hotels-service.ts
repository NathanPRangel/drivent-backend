import { TicketStatus } from '@prisma/client';
import { invalidDataError, notFoundError } from '@/errors';
import { cannotListHotelsError } from '@/errors/cannot-list-hotels-error';
import {
  bookingRepository,
  enrollmentRepository,
  hotelRepository,
  roomRepository,
  ticketsRepository,
} from '@/repositories';
import { HotelWithDetails } from '@/protocols';
import redis, { DEFAULT_EXP } from '@/config/redis';
import redisUtils from '@/utils/redis-utils';

async function validateUserBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function accomodationsTypeHelper(hotelId: number) {
  const accomodations = await roomRepository.findHotelAccommodations(hotelId);

  if (accomodations.length === 0) return 'Indisponível no momento!';
  if (accomodations.length === 3) return 'Single, Double e Triple';

  let text = '';
  let count = 0;

  accomodations.forEach((current) => {
    switch (current.capacity) {
      case 1:
        text += 'Single';
        count++;
        break;
      case 2:
        if (count + 1 === accomodations.length) {
          text += ' e ';
        } else if (count === 1) {
          text += ', ';
        }

        text += 'Double';
        count++;
        break;
      case 3:
        if (count > 0) text += ' e ';
        text += 'Triple';
        count++;
        break;
      default:
        text = 'Indisponível no momento!';
        break;
    }
  });

  return text;
}

async function getHotels(userId: number) {
  await validateUserBooking(userId);

  const cacheKey = 'hotels';
  const cachedHotels = await redisUtils.getCacheKey(cacheKey);

  if(cachedHotels) return cachedHotels;
  
  const hotels = await hotelRepository.findHotels();
  if (hotels.length === 0) throw notFoundError();
  
  const hotelsWithDetails: HotelWithDetails[] = [];
  
  for (let i = 0; i < hotels.length; i++) {
    const accommodations = await accomodationsTypeHelper(hotels[i].id);
    
    const {
      _sum: { capacity },
    } = await roomRepository.findHotelHotelTotalCapacity(hotels[i].id);
    
    const rooms = await roomRepository.findAllByHotelId(hotels[i].id);
    const hotelRoomsId = rooms.map((room) => room.id);
    
    const bookings = await bookingRepository.findByRoomId(hotelRoomsId);
    
    const capacityAvailable = capacity - bookings.length;
    
    hotelsWithDetails.push({
      ...hotels[i],
      accommodations,
      capacityAvailable: capacityAvailable === -1 ? 0 : capacityAvailable,
    });
  }

  await redisUtils.setCacheKey(cacheKey, hotelsWithDetails);
  
  return hotelsWithDetails;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await validateUserBooking(userId);

  const cacheKey = `hotel${hotelId}`;
  const cachedHotel = await redisUtils.getCacheKey(cacheKey);

  if(cachedHotel) return cachedHotel;

  if (!hotelId || isNaN(hotelId)) throw invalidDataError('hotelId');

  const hotelWithRooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!hotelWithRooms) throw notFoundError();

  await redisUtils.setCacheKey(cacheKey, hotelWithRooms);

  return hotelWithRooms;
}

export const hotelsService = {
  getHotels,
  getHotelsWithRooms,
};
