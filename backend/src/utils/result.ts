export type Result<T, E = Error> = 
  | { success: true; value: T; error?: never }
  | { success: false; error: E; value?: never };

export const success = <T>(value: T): Result<T, never> => ({ success: true, value });
export const error = <E>(error: E): Result<never, E> => ({ success: false, error });
