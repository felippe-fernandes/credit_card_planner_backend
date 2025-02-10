import * as bcrypt from 'bcrypt';

export async function encryptValue(value: string): Promise<string> {
  const saltRounds = 10; // Defina o número de rounds para o bcrypt

  // Criptografa o valor
  const encryptedValue = await bcrypt.hash(value, saltRounds);

  return encryptedValue;
}

export async function verifyEncryptedValue(
  value: string,
  encryptedValue: string,
): Promise<boolean> {
  // Compara o valor informado com o hash armazenado
  const isMatch = await bcrypt.compare(value, encryptedValue);

  return isMatch;
}
