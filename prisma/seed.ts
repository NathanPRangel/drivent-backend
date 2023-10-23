import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { string } from "joi";
const prisma = new PrismaClient();

async function createTicketTypes(tx: Prisma.TransactionClient) {
  await createTicketType(tx, false, true, "Presencial + Com Hotel");
  await createTicketType(tx, false, false, "Presencial + Sem Hotel");
  await createTicketType(tx, true, false, "Online");
}

async function createTicketType(tx: Prisma.TransactionClient, isRemote: boolean, includesHotel: boolean, name: string) {
  return tx.ticketType.create({
    data: {
      name: name,
      price: calculatePrice(isRemote, includesHotel),
      isRemote: isRemote,
      includesHotel: includesHotel,
    },
  });
}

function calculatePrice(isRemote:boolean, includesHotel:boolean) {
 
  if (isRemote === false) {
    if (includesHotel) {
      return 600; // Preço para ingresso presencial com hotel
    } else {
      return 250; // Preço para ingresso presencial sem hotel
    }
  } else {
    return 100; // Preço para ingresso online
  }
}

async function createActivities(tx: Prisma.TransactionClient, eventId: number) {
  const room1 = await tx.eventRoom.create({
    data: {
      name: "Auditório Principal",
      eventId: eventId,
    }
  });

  const room2 = await tx.eventRoom.create({
    data: {
      name: "Auditório Lateral",
      eventId: eventId,
    }
  });

  const room3 = await tx.eventRoom.create({
    data: {
      name: "Sala de Workshop",
      eventId: eventId,
    }
  });

  await tx.activity.createMany({
    data: [
      // first day
      {
        name: "Minecraft: montando o PC ideal",
        capacity: 30,
        eventRoomId: room1.id,
        startsAt: dayjs().add(3, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(3, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "Lol: montando o PC ideal",
        capacity: 30,
        eventRoomId: room1.id,
        startsAt: dayjs().add(3, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(3, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JS no web development",
        capacity: 50,
        eventRoomId: room2.id,
        startsAt: dayjs().add(3, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(3, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "O Futuro do JAVA",
        capacity: 40,
        eventRoomId: room3.id,
        startsAt: dayjs().add(3, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(3, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JAVA vs C#",
        capacity: 40,
        eventRoomId: room3.id,
        startsAt: dayjs().add(3, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(3, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      // second day
      {
        name: "Minecraft: montando o PC ideal",
        capacity: 30,
        eventRoomId: room2.id,
        startsAt: dayjs().add(4, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(4, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "Lol: montando o PC ideal",
        capacity: 40,
        eventRoomId: room2.id,
        startsAt: dayjs().add(4, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(4, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JS no web development",
        capacity: 50,
        eventRoomId: room3.id,
        startsAt: dayjs().add(4, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(4, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "O Futuro do JAVA",
        capacity: 40,
        eventRoomId: room1.id,
        startsAt: dayjs().add(4, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(4, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JAVA vs C#",
        capacity: 40,
        eventRoomId: room1.id,
        startsAt: dayjs().add(4, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(4, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      // third day
      {
        name: "Minecraft: montando o PC ideal",
        capacity: 30,
        eventRoomId: room3.id,
        startsAt: dayjs().add(5, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(5, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "Lol: montando o PC ideal",
        capacity: 50,
        eventRoomId: room3.id,
        startsAt: dayjs().add(5, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(5, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JS no web development",
        capacity: 50,
        eventRoomId: room1.id,
        startsAt: dayjs().add(5, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(5, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "O Futuro do JAVA",
        capacity: 50,
        eventRoomId: room2.id,
        startsAt: dayjs().add(5, "day").set("hour", 9).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(5, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
      },
      {
        name: "JAVA vs C#",
        capacity: 50,
        eventRoomId: room2.id,
        startsAt: dayjs().add(5, "day").set("hour", 10).set("minute", 0).set("second", 0).toDate(),
        endsAt: dayjs().add(5, "day").set("hour", 11).set("minute", 0).set("second", 0).toDate(),
      },
    ]
  })
}

async function createHotel(tx: Prisma.TransactionClient, name: string, image: string) {
  return tx.hotel.create({
    data: { name, image },
  });
}

async function createHotelRoom(tx: Prisma.TransactionClient, name: string, hotelId: number, capacity = 3) {
  return tx.room.create({
    data: { name, hotelId, capacity },
  });
}

async function crateHotelWithRooms(tx: Prisma.TransactionClient) {
  const hotel1 = await createHotel(tx, 'Driven Resort', 'https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg');
  const hotel2 = await createHotel(tx, 'Driven Palace', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/496718760.jpg?k=608ceb5268219094ffb5f99c00dd1b869daf59485ca2ce071c49a9bd2feeba4f&o=&hp=1');

  await createHotelRoom(tx, '101', hotel1.id);
  await createHotelRoom(tx, '102', hotel1.id, 2);
  await createHotelRoom(tx, '103', hotel1.id, 1);

  await createHotelRoom(tx, '201', hotel2.id, 1);
  await createHotelRoom(tx, '202', hotel2.id);
  await createHotelRoom(tx, '203', hotel2.id);
}

async function main() {
  await prisma.$transaction(async (tx) => {
    let event = await tx.event.findFirst();

    if (!event) {
      event = await tx.event.create({
        data: {
          title: "Driven.t",
          logoImageUrl: "https://files.driven.com.br/images/logo-rounded.png",
          backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
          startsAt: dayjs().toDate(),
          endsAt: dayjs().add(21, "days").toDate(),
        }
      });
    }

    const eventRoom = await tx.eventRoom.findFirst();

    if (!eventRoom) {
      await createActivities(tx, event.id);
    }

    const hotel = await tx.hotel.findFirst();

    if (!hotel) {
      await crateHotelWithRooms(tx)
    }

    const ticketType = await tx.ticketType.findFirst();

    if (!ticketType) {
      await createTicketTypes(tx);
    }

    return event;
  })
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
