import { prisma } from "@/config";
import faker from "@faker-js/faker";


export function createActivity(eventRoomId: number, startsAt?: Date, endsAt?: Date) {
    return prisma.activity.create({
        data: {
            name: faker.name.firstName(),
            startsAt: startsAt || faker.date.future(),
            endsAt: endsAt || faker.date.future(),
            eventRoomId,
            capacity: faker.datatype.number({ min: 10, max: 100 })
        }
    })
}

export function connectUserToActivity(activityId: number, userId: number) {
    return prisma.activity.update({
        where: {
            id: activityId
        },
        data: {
            User: {
                connect: {
                    id: userId
                }
            }
        }
    })
}