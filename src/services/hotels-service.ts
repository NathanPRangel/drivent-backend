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

  const hotels = await hotelRepository.findHotels();
  if (hotels.length === 0) throw notFoundError();

  const hotelsWithDetails: HotelWithDetails[] = [];

  for (let i = 0; i < hotels.length; i++) {
    const accommodations = await accomodationsTypeHelper(hotels[i].id);
    console.log(accommodations);

    const {
      _sum: { capacity },
    } = await roomRepository.findHotelHotelTotalCapacity(hotels[i].id);
    console.log('full capacity', capacity);

    const rooms = await roomRepository.findAllByHotelId(hotels[i].id);
    const hotelRoomsId = rooms.map((room) => room.id);
    console.log('hotelRoomsId', hotelRoomsId);

    const bookings = await bookingRepository.findByRoomId(hotelRoomsId);
    console.log('bookings', bookings);

    const capacityAvailable = capacity - bookings.length;

    hotelsWithDetails.push({
      ...hotels[i],
      accommodations,
      capacityAvailable: capacityAvailable === -1 ? 0 : capacityAvailable,
    });
  }

  return hotelsWithDetails;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await validateUserBooking(userId);

  if (!hotelId || isNaN(hotelId)) throw invalidDataError('hotelId');

  const hotelWithRooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!hotelWithRooms) throw notFoundError();

  return hotelWithRooms;
}

export const hotelsService = {
  getHotels,
  getHotelsWithRooms,
};
