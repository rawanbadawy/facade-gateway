import { BadRequestException } from '@nestjs/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// one Ajv instance for the app
const ajv = addFormats(new Ajv({ allErrors: true }), ['email', 'uri']);

/**
 * Validates `data` against `schema`. If invalid, throws 400 BadRequestException
 * with a concise, human-friendly message (caught by your global error filter).
 */
export function assertValid<T>(
  schema: object,
  data: unknown,
): asserts data is T {
  const validate = ajv.compile<T>(schema);
  if (!validate(data)) {
    const msg =
      validate.errors
        ?.map((e) => `${e.instancePath || '/'} ${e.message}`)
        .join('; ') || 'Invalid payload';
    throw new BadRequestException(msg);
  }
}
