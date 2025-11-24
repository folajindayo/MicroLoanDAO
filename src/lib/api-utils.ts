import { NextResponse } from 'next/server';

export function successResponse<T>(data: T) {
  return NextResponse.json(data);
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}
