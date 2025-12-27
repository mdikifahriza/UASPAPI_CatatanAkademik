import bcrypt from 'bcryptjs'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'

const JWT_SECRET: Secret =
  process.env.JWT_SECRET ?? 'Flsb9WO9lsGptYz5LgzH0ffMKVnrpbdXOt6C9rIZvxA='

const REFRESH_TOKEN_SECRET: Secret =
  process.env.REFRESH_TOKEN_SECRET ?? 'eLeGdBhS5GWqmB62ZqusYr+T1uqViyZaSR0JrulWbxw='

const JWT_EXPIRES_IN: SignOptions['expiresIn'] = '7d'
const REFRESH_TOKEN_EXPIRES_IN: SignOptions['expiresIn'] = '30d'

type TokenPayload = {
  id: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) return null
  return token
}
