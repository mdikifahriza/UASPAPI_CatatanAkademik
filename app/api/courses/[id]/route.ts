import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { successResponse, errorResponse, notFoundResponse, validationError } from '../../../../lib/response'
import { z } from 'zod'

// Validation schema for updating course
const updateCourseSchema = z.object({
  name: z.string().min(3).optional(),
  credits: z.number().int().min(1).max(6).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  description: z.string().optional(),
  instructorId: z.string().uuid().optional(),
})

// GET course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                nim: true,
                name: true,
                major: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return notFoundResponse('Course not found')
    }

    return successResponse(course, 'Course retrieved successfully')
  } catch (error: any) {
    console.error('Get course error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// PUT/PATCH update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return notFoundResponse('Course not found')
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = updateCourseSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    const data = validation.data

    // If instructorId is being updated, verify it exists
    if (data.instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: data.instructorId },
      })

      if (!instructor) {
        return errorResponse('Instructor not found', 404)
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(course, 'Course updated successfully')
  } catch (error: any) {
    console.error('Update course error:', error)
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

// DELETE course (Admin only - enforced by middleware)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      return notFoundResponse('Course not found')
    }

    // Delete course (cascade will delete enrollments)
    await prisma.course.delete({
      where: { id },
    })

    return successResponse(
      { id },
      'Course deleted successfully'
    )
  } catch (error: any) {
    console.error('Delete course error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
