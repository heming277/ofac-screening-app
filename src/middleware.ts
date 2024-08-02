import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const WINDOW_SIZE = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS = 10;
const store: { [key: string]: number[] } = {};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/screen') {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    
    if (!store[ip]) {
      store[ip] = [];
    }
    
    // Remove timestamps outside the current window
    store[ip] = store[ip].filter(timestamp => now - timestamp < WINDOW_SIZE);
    
    if (store[ip].length >= MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    store[ip].push(now);
  }
  
  return NextResponse.next();
}