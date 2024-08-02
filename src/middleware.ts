import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from 'limiter';

// Check if Date.now() is available, provide a fallback if not
if (typeof Date.now === 'undefined') {
  console.error('Date.now() is undefined. Providing a fallback.');
  Date.now = () => new Date().getTime();
} else {
  console.log('Date.now() is available.');
}

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute',
  fireImmediately: true,
});

export async function middleware(request: NextRequest) {
  console.log('Middleware invoked for:', request.nextUrl.pathname);
  
  if (request.nextUrl.pathname === '/api/screen') {
    try {
      const remaining = await limiter.removeTokens(1);
      if (remaining < 0) {
        console.warn('Rate limit exceeded.');
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    } catch (error) {
      console.error('Error in rate limiter:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
  
  return NextResponse.next();
}