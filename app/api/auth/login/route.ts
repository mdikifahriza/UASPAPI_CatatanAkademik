import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { comparePassword, generateToken, generateRefreshToken } from '../../../../lib/auth'
import { successResponse, errorResponse, validationError } from '../../../../lib/response'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    const { email, password } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
      },
      'Login successful',
      200
    )
  } catch (error: any) {
    console.error('Login error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}