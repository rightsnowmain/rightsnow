import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private ipMap = new Map<string, RateLimitRecord>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // Determine limit by route
    let maxRequests = 150; // standard API limit
    if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
      maxRequests = 15; // Auth brute-force protection
    } else if (req.path.includes('/comments') && req.method === 'POST') {
      maxRequests = 10; // Comment spam protection
    }

    const key = `${ip}:${req.path}`;
    const record = this.ipMap.get(key);

    if (!record || now > record.resetTime) {
      this.ipMap.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    record.count++;
    const remaining = Math.max(0, maxRequests - record.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please wait a moment before trying again.',
        retryAfterSeconds: retryAfter,
      });
    }

    next();
  }
}

