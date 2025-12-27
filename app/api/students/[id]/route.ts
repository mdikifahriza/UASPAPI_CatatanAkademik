import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { successResponse, errorResponse, notFoundResponse, validationError } from '../../../../lib/response'
import { z } from 'zod'

// Validation schema for updating student
const updateStudentSchema = z.object({
  name: z.string().min(3).optional(),
  major: z.string().min(3).optional(),
  semester: z.number().int().min(1).max(14).optional(),
  gpa: z.number().min(0).max(4).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  enrollmentYear: z.number().int().min(2000).max(2100).optional(),
})

// GET student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
                credits: true,
                semester: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return notFoundResponse('Student not found')
    }

    return successResponse(student, 'Student retrieved successfully')
  } catch (error: any) {
    console.error('Get student error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// PUT/PATCH update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    })

    if (!existingStudent) {
      return notFoundResponse('Student not found')
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = updateStudentSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    // Update student
    const student = await prisma.student.update({
      where: { id },
      data: validation.data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(student, 'Student updated successfully')
  } catch (error: any) {
    console.error('Update student error:', error)
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

// DELETE student (Admin only - enforced by middleware)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    })

    if (!existingStudent) {
      return notFoundResponse('Student not found')
    }

    // Delete student (cascade will delete enrollments)
    await prisma.student.delete({
      where: { id },
    })

    return successResponse(
      { id },
      'Student deleted successfully'
    )
  } catch (error: any) {
    console.error('Delete student error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
