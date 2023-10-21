import { ApplicationError } from '@/protocols';

export function cannotActivityError(): ApplicationError {
  return {
    name: 'CannotActivityError',
    message: 'Cannot sign up activities',
  };
}
