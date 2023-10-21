import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getActivities, signUpUserToActivity } from '@/controllers';

const activitiesRouter = Router();

activitiesRouter
    .all('/*', authenticateToken)
    .get('/', getActivities)
    .post('/', signUpUserToActivity)

export { activitiesRouter };
