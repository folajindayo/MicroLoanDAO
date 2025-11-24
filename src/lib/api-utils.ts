import { NextResponse } from 'next/server'

export function successResponse<T>(data: T) {
    return NextResponse.json(data)
}

export function errorResponse(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status })
}

export function validationErrorResponse(errors: any) {
    return NextResponse.json({ error: 'Validation Error', details: errors }, { status: 400 })
}
