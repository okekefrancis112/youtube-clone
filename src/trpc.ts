export interface TRPCSuspenseResult<T> {
  json: T;
  meta: {
    values: Record<string, unknown>;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

}

// Type guard for the suspense result
export function isSuspenseResult<T>(data: unknown): data is TRPCSuspenseResult<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'json' in data &&
    'meta' in data
  );
}