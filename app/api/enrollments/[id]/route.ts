import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { successResponse, errorResponse, notFoundResponse, validationError } from '../../../../lib/response'
import { z } from 'zod'

// Validation schema for updating enrollment
const updateEnrollmentSchema = z.object({
  grade: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'DROPPED']).optional(),
})

// GET enrollment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
            major: true,
            semester: true,
            gpa: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            semester: true,
            description: true,
          },
        },
      },
    })

    if (!enrollment) {
      return notFoundResponse('Enrollment not found')
    }

    return successResponse(enrollment, 'Enrollment retrieved successfully')
  } catch (error: any) {
    console.error('Get enrollment error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// PUT/PATCH update enrollment (grade and status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!existingEnrollment) {
      return notFoundResponse('Enrollment not found')
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = updateEnrollmentSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    // Update enrollment
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: validation.data,
      include: {
        student: {
          select: {
            nim: true,
            name: true,
          },
        },
        course: {
          select: {
            code: true,
            name: true,
            credits: true,
          },
        },
      },
    })

    return successResponse(enrollment, 'Enrollment updated successfully')
  } catch (error: any) {
    console.error('Update enrollment error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// PATCH - alias for PUT
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}

// DELETE enrollment (Admin only - enforced by middleware)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!existingEnrollment) {
      return notFoundResponse('Enrollment not found')
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id },
    })

    return successResponse(
      { id },
      'Enrollment deleted successfully'
    )
  } catch (error: any) {
    console.error('Delete enrollment error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
