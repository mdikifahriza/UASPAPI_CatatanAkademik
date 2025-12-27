import { NextRequest } from 'next/server'
import { verifyRefreshToken, generateToken, generateRefreshToken, extractToken } from '../../../../lib/auth'
import { successResponse, errorResponse } from '../../../../lib/response'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const refreshToken = extractToken(authHeader)

    if (!refreshToken) {
      return errorResponse('Refresh token not provided', 401)
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return errorResponse('Invalid or expired refresh token', 401)
    }

    const newToken = generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    })

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    })

    return successResponse(
      {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully',
      200
    )
  } catch (error: any) {
    console.error('Refresh token error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}