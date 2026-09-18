import { registerDecorator, ValidationOptions } from 'class-validator';

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Valida que uma data (YYYY-MM-DD) corresponde a alguém com pelo menos `minAge` anos. */
export function IsMinAge(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMinAge',
      target: object.constructor,
      propertyName,
      options: {
        message: `Você precisa ter pelo menos ${minAge} anos`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return false;
          return calculateAge(value) >= minAge;
        },
      },
    });
  };
}
