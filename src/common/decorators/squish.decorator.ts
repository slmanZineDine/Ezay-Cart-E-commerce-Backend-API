import { Transform, TransformFnParams } from 'class-transformer';

export function Squish() {
  return Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.replace(/\s+/g, ' ').trim();
    }
    return value;
  });
}
