import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { successResponse, errorResponse, validationError } from '../../../lib/response'
import { z } from 'zod'

// Validation schema for creating enrollment
const enrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  courseId: z.string().uuid('Invalid course ID'),
  grade: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'DROPPED']).optional().default('ACTIVE'),
})

// GET all enrollments
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (courseId) where.courseId = courseId

    // Get enrollments with pagination
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              nim: true,
              name: true,
              major: true,
              semester: true,
            },
          },
          course: {
            select: {
              id: true,
              code: true,
              name: true,
              credits: true,
              semester: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.enrollment.count({ where }),
    ])

    return successResponse(
      {
        enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Enrollments retrieved successfully'
    )
  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// POST create new enrollment
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = enrollmentSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    const data = validation.data

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    })

    if (!student) {
      return errorResponse('Student not found', 404)
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    })

    if (!course) {
      return errorResponse('Course not found', 404)
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId: data.courseId,
        },
      },
    })

    if (existingEnrollment) {
      return errorResponse('Student is already enrolled in this course', 400)
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data,
      include: {
        student: {
          select: {
            nim: true,
            name: true,
            major: true,
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

    return successResponse(enrollment, 'Enrollment created successfully', 201)
  } catch (error: any) {
    console.error('Create enrollment error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
