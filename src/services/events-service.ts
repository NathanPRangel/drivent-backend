import { Event } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';
import { eventRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';
import redisUtils from '@/utils/redis-utils';

const CACHE_KEY = 'event';

async function getFirstEvent(): Promise<GetFirstEventResult> {
  const cachedEvent = await redisUtils.getCacheKey(CACHE_KEY);
  if(cachedEvent) return cachedEvent;

  const event = await eventRepository.findFirst();
  if (!event) throw notFoundError();

  const formatedEvent = exclude(event, 'createdAt', 'updatedAt');

  await redisUtils.setCacheKey(CACHE_KEY, formatedEvent, 0);

  return formatedEvent;
}

export type GetFirstEventResult = Omit<Event, 'createdAt' | 'updatedAt'>;

async function isCurrentEventActive(): Promise<boolean> {
  const cachedEvent = await redisUtils.getCacheKey(CACHE_KEY);

  const event = cachedEvent || await eventRepository.findFirst();
  if (!event) return false;

  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

export const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};
