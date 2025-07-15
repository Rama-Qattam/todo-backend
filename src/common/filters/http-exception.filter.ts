// This is a global exception filter that catches all exceptions thrown in the application
// It transforms exceptions into a standardized HTTP response format

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Catches all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Get HTTP context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default error status and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      // Extract message from error response object
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const msg = (errorResponse as { message?: string | string[] }).message;
        message = Array.isArray(msg) ? msg[0] : msg || message;
      } else {
        message = errorResponse;
      }
    } 
    // Handle standard JS errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Return standardized error response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
