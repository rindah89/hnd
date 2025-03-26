import { ApiResponse, ErrorResponse } from '../types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createSuccessResponse<T>(
  data: T,
  status = 200,
  message = 'Success'
): ApiResponse<T> {
  return {
    data,
    status,
    message,
  };
}

export function createErrorResponse(
  error: string,
  status = 500,
  details?: unknown
): ErrorResponse {
  return {
    error,
    status,
    details,
  };
}

export async function handleApiError(error: unknown): Promise<ErrorResponse> {
  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.status, error.details);
  }

  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }

  return createErrorResponse('An unexpected error occurred');
}

export function validateRequestMethod(
  method: string,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(method)) {
    throw new ApiError(
      405,
      `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    );
  }
} 