import { prisma } from '@/config';
import { PaymentParams } from '@/protocols';
import { Prisma, PrismaClient } from '@prisma/client';

async function findPaymentByTicketId(ticketId: number) {
  const result = await prisma.payment.findFirst({
    where: { ticketId },
  });
  return result;
}

async function createPayment(ticketId: number, params: PaymentParams, db: PrismaClient | Prisma.TransactionClient = prisma) {
  const result = await db.payment.create({
    data: {
      ticketId,
      ...params,
    },
  });

  return result;
}

export const paymentsRepository = {
  findPaymentByTicketId,
  createPayment,
};
