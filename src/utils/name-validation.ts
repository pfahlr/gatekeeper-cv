import { z } from 'zod';

export const NAME_REGEX = /^[a-z0-9_]+$/;

export const nameSchema = z.string().regex(NAME_REGEX, {
  message: 'Name must contain only lowercase letters, numbers, and underscores',
});

export function validateName(name: string): boolean {
  return NAME_REGEX.test(name);
}
