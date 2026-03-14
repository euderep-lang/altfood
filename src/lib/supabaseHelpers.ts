// Utility helpers for Supabase operations with timeouts and error handling

/**
 * Creates an AbortSignal that times out after the specified milliseconds
 */
export function createTimeoutSignal(ms = 10000): AbortSignal {
  return AbortSignal.timeout(ms);
}

/**
 * Wraps a Supabase operation with a timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs = 10000,
  errorMessage = 'A operação demorou demais. Tente novamente.'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
