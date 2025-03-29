import { PrismaClient } from '@prisma/client';
import { addMonths, format, isBefore, setDate } from 'date-fns';

const prisma = new PrismaClient();

function calculateInstallmentDates(purchaseDate: Date, payDay: number, installments: number): string[] {
  const installmentDates: string[] = [];
  const closingDate = setDate(new Date(purchaseDate), payDay);

  let firstInstallmentDate: Date;
  if (isBefore(purchaseDate, closingDate)) {
    firstInstallmentDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1);
  } else {
    firstInstallmentDate = addMonths(new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1), 1);
  }

  for (let i = 0; i < installments; i++) {
    const installmentDate = addMonths(firstInstallmentDate, i);
    installmentDates.push(format(installmentDate, 'MM/yyyy'));
  }

  return installmentDates;
}

async function updateTransactions() {
  console.log('🔄 Fetching transactions...');
  const transactions = await prisma.transaction.findMany({
    include: {
      card: true,
    },
  });

  console.log(`🔍 Found ${transactions.length} transactions`);

  for (const transaction of transactions) {
    if (!transaction.card) {
      console.warn(`⚠️ Skipping transaction ${transaction.id}, card not found`);
      continue;
    }

    const installmentDates = calculateInstallmentDates(
      new Date(transaction.purchaseDate),
      transaction.card.payDay,
      transaction.installments,
    );

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { installmentDates },
    });

    console.log(`✅ Updated transaction ${transaction.id}`);
  }

  console.log('🎉 Transactions updated successfully');
}

updateTransactions()
  .catch((error) => {
    console.error('❌ Error updating transactions:', error);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
