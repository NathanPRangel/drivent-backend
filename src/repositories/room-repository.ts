import { prisma } from '@/config';

async function findHotelAccommodations(hotelId: number) {
  return prisma.room.findMany({
    where: { hotelId },
    distinct: ['capacity'],
    select: {
      capacity: true,
    },
    orderBy: {
      capacity: 'asc',
    },
  });
}

async function findHotelHotelTotalCapacity(hotelId: number) {
  return prisma.room.aggregate({
    where: { hotelId },
    _sum: { capacity: true },
  });
}

async function findAllByHotelId(hotelId: number) {
  return prisma.room.findMany({
    where: { hotelId },
  });
}

async function findById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId },
    include: {
      Hotel: true
    }
  });
}

export const roomRepository = {
  findHotelAccommodations,
  findHotelHotelTotalCapacity,
  findAllByHotelId,
  findById,
};
