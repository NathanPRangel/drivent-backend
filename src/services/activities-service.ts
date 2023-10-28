import { TicketStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { activitiesRepository, enrollmentRepository, ticketsRepository } from '@/repositories';
import { cannotActivityError, notFoundError } from '@/errors';

async function validateUserToActivity(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw cannotActivityError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote) {
    throw cannotActivityError();
  }
}

async function validateUserActivitiesConfrontation(userId: number, activityId: number) {
  const activities = await activitiesRepository.findActivitiesByUserId(userId);
  if (!activities) return;

  const activityToSignUp = await activitiesRepository.findActivityById(activityId);

  const activityConfrontation = activities.some(
    (activity) =>
      (activityToSignUp.startsAt >= activity.startsAt && activityToSignUp.startsAt < activity.endsAt) ||
      (activityToSignUp.endsAt > activity.startsAt && activityToSignUp.endsAt <= activity.endsAt),
  );
  if (activityConfrontation) throw cannotActivityError();
}

async function getActivities(userId: number) {
  await validateUserToActivity(userId);

  return await activitiesRepository.findActivities();
}

async function getActivitiesByUser(userId: number) {

  return await activitiesRepository.findActivitiesByUserId(userId);

}

async function signUpUserToActivity(userId: number, activityId: number) {
  await validateUserToActivity(userId);
  await validateUserActivitiesConfrontation(userId, activityId);

  return await activitiesRepository.signUpUserToActivity(userId, activityId);
}

export const activitiesService = {
  getActivities,
  signUpUserToActivity,
  getActivitiesByUser
};
