import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { successResponse, errorResponse, validationError } from '../../../lib/response'
import { z } from 'zod'

// Validation schema for creating course
const courseSchema = z.object({
  code: z.string().min(3, 'Course code must be at least 3 characters'),
  name: z.string().min(3, 'Course name must be at least 3 characters'),
  credits: z.number().int().min(1).max(6),
  semester: z.number().int().min(1).max(8),
  description: z.string().optional(),
  instructorId: z.string().uuid('Invalid instructor ID'),
})

// GET all courses
export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
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
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count(),
    ])

    return successResponse(
      {
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Courses retrieved successfully'
    )
  } catch (error: any) {
    console.error('Get courses error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// POST create new course
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = courseSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    const data = validation.data

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: data.code },
    })

    if (existingCourse) {
      return errorResponse('Course code already exists', 400)
    }

    // Verify instructor exists
    const instructor = await prisma.user.findUnique({
      where: { id: data.instructorId },
    })

    if (!instructor) {
      return errorResponse('Instructor not found', 404)
    }

    // Create course
    const course = await prisma.course.create({
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

    return successResponse(course, 'Course created successfully', 201)
  } catch (error: any) {
    console.error('Create course error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
