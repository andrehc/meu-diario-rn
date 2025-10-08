import { hashPin, comparePin } from './pinService';

describe('PinService', () => {
  const fixedPIN = '0901';
  const randomPIN = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  // const testPin = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  it('deve gerar um hash diferente do PIN original', async () => {
    const hashedPin = await hashPin(fixedPIN);
    expect(hashedPin).not.toBe(fixedPIN);
  });

  it('deve validar um PIN com sucesso contra o seu hash', async () => {
    const hashedPin = await hashPin(randomPIN);
    const isValid = await comparePin(randomPIN, hashedPin);
    expect(isValid).toBe(true);
  });

  it('deve falhar ao validar um PIN incorreto', async () => {
    const hashedPin = await hashPin(randomPIN);
    const isMatch = await comparePin('0000', hashedPin);
    expect(isMatch).toBe(false);
  });
});
