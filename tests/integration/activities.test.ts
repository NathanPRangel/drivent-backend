import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";

import * as jwt from 'jsonwebtoken';
import { createEnrollmentWithAddress, createEvent, createTicket, createTicketType, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import redis from "@/config/redis";
import { TicketStatus } from "@prisma/client";
import { createEventRoom } from "../factories/eventRoom-factory";
import { connectUserToActivity, createActivity } from "../factories/activities-factory";

beforeAll(async () => {
    await init();
});

afterEach(async () => {
    await cleanDb();
    await redis.flushAll();
});

afterAll(async () => {
    await cleanDb();
    await redis.flushAll();
});

const server = supertest(app)

describe('GET /activities', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/activities');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser()
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe('when token is valid', () => {
        it("should respond with status 403 when user doesn't have a enrollment", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 404 when user doesn't have a ticket", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            await createEnrollmentWithAddress(user)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with status 403 when user's ticket isn't paid yet", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 403 when user ticket is Remote", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(true, false)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should return empty array when there is no activity", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toEqual([])
        })
        it("should return array of activities when everything is ok", async () => {
            const user = await createUser()
            const secondUser = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const event = await createEvent()
            const eventRoom = await createEventRoom(event.id)
            const activity = await createActivity(eventRoom.id)
            await connectUserToActivity(activity.id, user.id)
            await connectUserToActivity(activity.id, secondUser.id)
            const response = await server.get("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    name: expect.any(String),
                    id: expect.any(Number),
                    capacity: expect.any(Number),
                    startsAt: expect.any(String),
                    endsAt: expect.any(String),
                    EventRoom: expect.objectContaining({
                        name: expect.any(String),
                        id: expect.any(Number)
                    }),
                    User: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number)
                        }),
                        expect.objectContaining({
                            id: expect.any(Number)
                        })
                    ])
                })
            ]))
        })
    })
})

describe('POST /activities', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/activities');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.post('/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser()
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post('/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe('when token is valid', () => {
        it("should respond with status 403 when user doesn't have a enrollment", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 404 when user doesn't have a ticket", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            await createEnrollmentWithAddress(user)
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it("should respond with status 403 when user's ticket is not paid yet", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 403 when user's ticket is remote", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(true, false)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 403 when user try to singup on a activity that happens at the same time of another user's activity", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const event = await createEvent()
            const firstEventRoom = await createEventRoom(event.id)
            const eventRoom = await createEventRoom(event.id)
            const startsAt = new Date("2023-11-03T09:00:00")
            const endsAt = new Date("2023-11-03T10:00:00")
            const activity = await createActivity(eventRoom.id, startsAt, endsAt)
            const firstActivity = await createActivity(firstEventRoom.id, startsAt, endsAt)
            await connectUserToActivity(firstActivity.id, user.id)
            const body = { activityId: activity.id }
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`).send(body)
            expect(response.status).toBe(httpStatus.FORBIDDEN)
        })
        it("should respond with status 200 and activity details when everything is ok", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const event = await createEvent()
            const firstEventRoom = await createEventRoom(event.id)
            const eventRoom = await createEventRoom(event.id)
            const firstStartsAt = new Date("2023-11-03T09:00:00")
            const firstEndsAt = new Date("2023-11-03T10:00:00")
            const startsAt = new Date("2023-11-04T09:00:00")
            const endsAt = new Date("2023-11-04T10:00:00")
            const firstActivity = await createActivity(firstEventRoom.id, firstStartsAt, firstEndsAt)
            const activity = await createActivity(eventRoom.id, startsAt, endsAt)
            await connectUserToActivity(firstActivity.id, user.id)
            const body = { activityId: activity.id }
            const response = await server.post("/activities").set('Authorization', `Bearer ${token}`).send(body)
            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toEqual(expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                startsAt: expect.any(String),
                endsAt: expect.any(String),
                eventRoomId: expect.any(Number),
                capacity: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            }))
        })
    })
})

describe('GET /activities/activities', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/activities/activities');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/activities/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser()
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/activities/activities').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe('when token is valid', () => {
        it("should return status 200 and empty array when user doesn't have any activities yet", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const event = await createEvent()
            const eventRoom = await createEventRoom(event.id)
            const activity = await createActivity(eventRoom.id)
            const response = await server.get("/activities/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toEqual([])
        })
        it("should return status 200 and user's activities", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const event = await createEvent()
            const eventRoom = await createEventRoom(event.id)
            const activity = await createActivity(eventRoom.id)
            await connectUserToActivity(activity.id, user.id)
            const response = await server.get("/activities/activities").set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.OK)
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    startsAt: expect.any(String),
                    endsAt: expect.any(String),
                    eventRoomId: expect.any(Number),
                    capacity: expect.any(Number),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                })
            ]))
        })
    })
})