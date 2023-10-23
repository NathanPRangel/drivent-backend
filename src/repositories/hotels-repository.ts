import { prisma } from '@/config';

async function findHotels() {
  return await prisma.hotel.findMany({
    include: {
      Rooms: {
        select: {
          capacity: true,
          _count: {
            select: {
              Booking: true,
            },
          },
        },
      },
    },
  });
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: {
        include: {
          _count: {
            select: { Booking: true },
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
