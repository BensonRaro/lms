import type { Request, Response, NextFunction } from 'express';

/**
 * Standard API error shape: { error: { code, message } }
 */
export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public override message: string
  ) {
    super(message);
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Global error handling middleware.
 * Ensures production errors never expose stack traces or internals.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Log unexpected errors
  console.error('Unhandled Error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : (err as Error).message,
    },
  });
};
