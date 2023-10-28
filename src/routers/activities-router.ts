import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getActivities, signUpUserToActivity, getActivitiesByUser } from '@/controllers';

const activitiesRouter = Router();

activitiesRouter
    .all('/*', authenticateToken)
    .get('/', getActivities)
    .get('/activities', getActivitiesByUser)
    .post('/', signUpUserToActivity);

export { activitiesRouter };
