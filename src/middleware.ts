import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from 'limiter';

// Check if Date.now() is available, provide a fallback if not
if (typeof Date.now === 'undefined') {
  Date.now = () => new Date().getTime();
}

const limiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute',
  fireImmediately: true,
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/screen') {
    const remaining = await limiter.removeTokens(1);
    if (remaining < 0) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  return NextResponse.next();
}