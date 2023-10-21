import { prisma } from '@/config';

async function findActivities() {
  return await prisma.activity.findMany({
    select: {
      id: true,
      name: true,
      capacity: true,
      startsAt: true,
      endsAt: true,
      User: {
        select: {
          id: true
        }
      },
      EventRoom: {
        select: {
          id: true,
          name: true
        }
      }

    }
  })
}

async function signUpUserToActivity(userId: number, activityId: number) {
  return await prisma.activity.update({
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

async function findActivitiesByUserId(userId: number) {
  return await prisma.activity.findMany({
    where: {
      User: {
        some: {
          id: userId
        }
      }
    }
  })
}

async function findActivityById(activityId: number) {
  return await prisma.activity.findUnique({
    where: {
      id: activityId
    }
  })
}


export const activitiesRepository = {
  findActivities,
  signUpUserToActivity,
  findActivitiesByUserId,
  findActivityById,

};
