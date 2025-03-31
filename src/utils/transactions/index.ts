import { addMonths, format, isBefore, setDate } from 'date-fns';

export function calculateInstallmentDates(
  purchaseDate: Date,
  payDay: number,
  installments: number,
): string[] {
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
