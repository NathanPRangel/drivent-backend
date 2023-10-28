import { Address, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/config';

async function upsert(
  enrollmentId: number,
  createdAddress: CreateAddressParams,
  updatedAddress: UpdateAddressParams,
  db: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return db.address.upsert({
    where: {
      enrollmentId,
    },
    create: {
      ...createdAddress,
      Enrollment: { connect: { id: enrollmentId } },
    },
    update: updatedAddress,
  });
}

export type CreateAddressParams = Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'enrollmentId'>;
export type UpdateAddressParams = CreateAddressParams;

export const addressRepository = {
  upsert,
};
