import { prisma } from '@/config';

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      Rooms: {
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
          capacity: true,
          hotelId: true,
          createdAt: true,
          updatedAt: true,
          Booking: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      },
    },
  });
}

export const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};
