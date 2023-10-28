import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { activitiesService } from '@/services';

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const activities = await activitiesService.getActivities(userId);

  res.status(httpStatus.OK).send(activities);
}

export async function getActivitiesByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const activities = await activitiesService.getActivitiesByUser(userId);

  res.status(httpStatus.OK).send(activities);
}

export async function signUpUserToActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;
  const activity = await activitiesService.signUpUserToActivity(userId, activityId);

  res.status(httpStatus.OK).send(activity);
}
