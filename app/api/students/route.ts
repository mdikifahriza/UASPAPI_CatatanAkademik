import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, validationError } from '@/lib/response'
import { z } from 'zod'

// Validation schema for creating student
const studentSchema = z.object({
  nim: z.string().min(5, 'NIM must be at least 5 characters'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  major: z.string().min(3, 'Major is required'),
  semester: z.number().int().min(1).max(14),
  gpa: z.number().min(0).max(4).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  enrollmentYear: z.number().int().min(2000).max(2100),
})

// GET all students
export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get token from header (set by middleware)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Log untuk debugging
    console.log(`[GET /api/students] Token: ${token?.substring(0, 20)}...`)
    console.log(`[GET /api/students] Page: ${page}, Limit: ${limit}`)

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        skip,
        take: limit,
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
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.student.count(),
    ])

    return successResponse(
      {
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Students retrieved successfully'
    )
  } catch (error: any) {
    console.error('Get students error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    // Get user ID & token from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    const userEmail = request.headers.get('x-user-email')
    const userRole = request.headers.get('x-user-role')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Log untuk debugging
    console.log(`[POST /api/students] User ID: ${userId}`)
    console.log(`[POST /api/students] User Email: ${userEmail}`)
    console.log(`[POST /api/students] User Role: ${userRole}`)
    console.log(`[POST /api/students] Token: ${token?.substring(0, 20)}...`)

    if (!userId) {
      return errorResponse('User not authenticated', 401)
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = studentSchema.safeParse(body)
    if (!validation.success) {
      return validationError(validation.error.errors)
    }

    const data = validation.data

    // Check if NIM already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nim: data.nim },
    })

    if (existingStudent) {
      return errorResponse('NIM already exists', 400)
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        ...data,
        createdById: userId,
      },
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

    console.log(`[POST /api/students] Student created: ${student.id}`)

    return successResponse(student, 'Student created successfully', 201)
  } catch (error: any) {
    console.error('Create student error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}