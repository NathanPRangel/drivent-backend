import { Prisma, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { string } from "joi";
const prisma = new PrismaClient();

async function createTicketTypes() {
  await createTicketType(false, true, "Presencial + Com Hotel");
  await createTicketType(false, false, "Presencial + Sem Hotel");
  await createTicketType(true, false, "Online");
}

async function createTicketType(isRemote: boolean, includesHotel: boolean, name: string) {
  return prisma.ticketType.create({
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

    const room = await tx.room.findFirst();

    if (!room) {
      await createActivities(tx, event.id);
    }

    return event;
  })

  await createTicketTypes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
