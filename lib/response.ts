import { NextResponse } from 'next/server'

// Success response
export function successResponse(data: any, message: string = 'Success', status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

// Error response
export function errorResponse(error: string, code: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status: code }
  )
}

// Validation error response
export function validationError(errors: any) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      code: 400,
      details: errors,
    },
    { status: 400 }
  )
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized access') {
  return errorResponse(message, 401)
}

// Forbidden response
export function forbiddenResponse(message: string = 'Forbidden - insufficient permissions') {
  return errorResponse(message, 403)
}

// Not found response
export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404)
}
