import { Room } from "@prisma/client";

type RoomWCount = Omit<Room, 'id' | 'name' | 'hotelId' | 'createdAt' | 'updatedAt'> & { _count: { Booking: number } };

export function generateType(Rooms: RoomWCount[]){
  const checkQtd = (n: number) => {
    return Rooms.some(({ capacity }) => capacity === (capacity > 3 && n === 3 ? capacity : n));
  };
  if (checkQtd(1) && checkQtd(2) && checkQtd(3)) return 'Single, Double e Triple';
  if (checkQtd(1) && checkQtd(2)) return 'Single e Double';
  if (checkQtd(1) && checkQtd(3)) return 'Single e Triple';
  if (checkQtd(2) && checkQtd(3)) return 'Double e Triple';
  if (checkQtd(1)) return 'Single';
  if (checkQtd(2)) return 'Double';
  if (checkQtd(3)) return 'Triple';
};

export function generateRemainingVacancies(Rooms: RoomWCount[]){
  return Rooms.map(({ _count: { Booking }, capacity }) => capacity - Booking).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
};