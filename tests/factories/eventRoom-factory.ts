import { prisma } from "@/config";
import faker from "@faker-js/faker";



export function createEventRoom(eventId: number) {
    return prisma.eventRoom.create({
        data: {
            name: faker.name.firstName(),
            eventId
        }
    })
}