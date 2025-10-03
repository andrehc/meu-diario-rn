import * as bcrypt from 'bcryptjs';

const saltRounds = 10;

/**
 * @param pin - PIN de 4 digitos.
 * @returns Hash do PIN.
 */
export const hashPin = async (pin: string): Promise<string> => {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(pin, salt);
};

/**
 * @param pin - PIN de 4 digitos fornecido pelo usuario.
 * @param hashPin - Hash do PIN armazenado.
 * @returns true se o PIN fornecido é igual ao hash armazenado, senao false.
 */
export const comparePin = async (pin: string, hashPin: string): Promise<boolean> => {
    return bcrypt.compare(pin, hashPin);
};
