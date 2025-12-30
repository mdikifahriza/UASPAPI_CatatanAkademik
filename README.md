# download lewat git utowo zip
# npm install
# Sesuaikan env / chatgpt "Gimana cara daftar supabase dan mendapatkan supabase url, publishable api key dan service role key"

# npx prisma generate
# npx prisma db push
# npm run dev
# https://claude.ai/share/21ea6dc5-975f-4616-94fa-4fa3accb9bfe
# https://claude.ai/share/c2cdefe6-51e4-46b7-9710-54710c1bba44
# https://claude.ai/share/f87c6d5b-38dc-466b-8526-f6695c28fe8e
# https://chatgpt.com/share/69506658-2438-8006-bed5-d039ba74f8ad
# 📚 Sistem Catatan Akademik REST API

## UAS Pemrograman API - Teknik Informatika UNISBA Blitar

REST API untuk manajemen data akademik mahasiswa dengan Next.js 15, TypeScript, Prisma ORM, dan Supabase PostgreSQL.

---

## 🚀 Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod

---

## 📋 Fitur Utama

### 🔐 Authentication & Authorization
- ✅ Register dengan password hashing (bcrypt)
- ✅ Login dengan JWT token generation
- ✅ Middleware authentication untuk protected routes
- ✅ Role-based authorization (ADMIN/USER)

### 👥 User Management (Admin Only)
- ✅ CRUD operations untuk users
- ✅ Role management

### 🎓 Student Management
- ✅ CRUD operations untuk data mahasiswa
- ✅ Informasi lengkap: NIM, nama, jurusan, semester, IPK
- ✅ Tracking enrollment courses

### 📖 Course Management
- ✅ CRUD operations untuk mata kuliah
- ✅ Informasi: kode MK, nama, SKS, semester
- ✅ Assignment dosen pengampu

### 📝 Enrollment Management
- ✅ Pendaftaran mahasiswa ke mata kuliah
- ✅ Update nilai dan status (ACTIVE/COMPLETED/DROPPED)
- ✅ Query filter by student/course

---

## 🗂️ Database Schema

### Users
```typescript
- id: String (UUID)
- name: String
- email: String (unique)
- password: String (hashed)
- role: Enum (ADMIN/USER)
- createdAt: DateTime
- updatedAt: DateTime
```

### Students
```typescript
- id: String (UUID)
- nim: String (unique)
- name: String
- major: String
- semester: Int (1-14)
- gpa: Float (0-4)
- phone: String?
- address: String?
- enrollmentYear: Int
- createdById: String (FK -> Users)
- createdAt: DateTime
- updatedAt: DateTime
```

### Courses
```typescript
- id: String (UUID)
- code: String (unique)
- name: String
- credits: Int (1-6 SKS)
- semester: Int (1-8)
- description: String?
- instructorId: String (FK -> Users)
- createdAt: DateTime
- updatedAt: DateTime
```

### Enrollments
```typescript
- id: String (UUID)
- studentId: String (FK -> Students)
- courseId: String (FK -> Courses)
- grade: String? (A, B+, B, C+, C, D, E)
- status: Enum (ACTIVE/COMPLETED/DROPPED)
- createdAt: DateTime
- updatedAt: DateTime
- UNIQUE(studentId, courseId)
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- npm atau yarn
- Akun Supabase (gratis)

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd academic-system-api
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Supabase Database

#### a. Buat Project Supabase
1. Buka [https://supabase.com](https://supabase.com)
2. Sign up / Login
3. Klik "New Project"
4. Isi nama project dan password database
5. Pilih region terdekat (Singapore untuk Indonesia)
6. Klik "Create new project"

#### b. Get Connection String
1. Buka Project Settings > Database
2. Scroll ke section "Connection String"
3. Pilih tab "URI" untuk `DATABASE_URL`
4. Copy connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Untuk `DIRECT_URL`, gunakan "Connection Pooling" disabled:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 4️⃣ Setup Environment Variables
```bash
# Copy .env.example ke .env
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Supabase Anda:
```env
DATABASE_URL="postgresql://postgres.[your-project-ref]:[your-password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://postgres.[your-project-ref]:[your-password]@db.[your-project-ref].supabase.co:5432/postgres"

JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

### 5️⃣ Generate JWT Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 6️⃣ Push Database Schema
```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke Supabase
npx prisma db push
```

### 7️⃣ (Optional) Open Prisma Studio
```bash
npx prisma studio
```

### 8️⃣ Run Development Server
```bash
npm run dev
```

API akan berjalan di: `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication (Public)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Students (Protected - Token Required)

#### Get All Students
```http
GET /api/students?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Student by ID
```http
GET /api/students/{id}
Authorization: Bearer <token>
```

#### Create Student
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "nim": "2024001",
  "name": "Jane Doe",
  "major": "Teknik Informatika",
  "semester": 1,
  "gpa": 3.8,
  "phone": "08123456789",
  "address": "Blitar",
  "enrollmentYear": 2024
}
```

#### Update Student
```http
PUT /api/students/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "semester": 2,
  "gpa": 3.9
}
```

#### Delete Student (Admin Only)
```http
DELETE /api/students/{id}
Authorization: Bearer <token>
```

### Courses (Protected - Token Required)

#### Get All Courses
```http
GET /api/courses?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Course
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "IF101",
  "name": "Pemrograman Dasar",
  "credits": 3,
  "semester": 1,
  "description": "Mata kuliah pengenalan pemrograman",
  "instructorId": "user-uuid-here"
}
```

#### Update Course
```http
PUT /api/courses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pemrograman Dasar (Update)",
  "credits": 4
}
```

#### Delete Course (Admin Only)
```http
DELETE /api/courses/{id}
Authorization: Bearer <token>
```

### Enrollments (Protected - Token Required)

#### Get All Enrollments
```http
GET /api/enrollments?studentId={id}&courseId={id}&page=1&limit=10
Authorization: Bearer <token>
```

#### Create Enrollment
```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "student-uuid",
  "courseId": "course-uuid",
  "status": "ACTIVE"
}
```

#### Update Enrollment (Update Grade)
```http
PUT /api/enrollments/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": "A",
  "status": "COMPLETED"
}
```

#### Delete Enrollment (Admin Only)
```http
DELETE /api/enrollments/{id}
Authorization: Bearer <token>
```

---

## 🔒 Security Features

### Password Hashing
- Menggunakan bcrypt dengan salt rounds 10
- Password tidak pernah disimpan plain text

### JWT Authentication
- Token expire dalam 7 hari (configurable)
- Token berisi: `{ id, email, role }`
- Dikirim via header: `Authorization: Bearer <token>`

### Middleware Protection
- Validasi token untuk semua protected routes
- Role-based authorization:
  - `/api/users/*` - ADMIN only
  - DELETE operations - ADMIN only
  - Other routes - Authenticated users

### Input Validation
- Menggunakan Zod schema validation
- Validasi di setiap endpoint
- Error messages yang jelas

---

## 🧪 Testing dengan Postman

### 1. Import Collection
Download Postman collection dari repository (jika tersedia)

### 2. Setup Environment
Buat environment baru dengan variables:
```
base_url: http://localhost:3000
token: (akan di-set setelah login)
```

### 3. Testing Flow

#### Step 1: Register User
```
POST {{base_url}}/api/auth/register
Body: { name, email, password, role }
```

#### Step 2: Login
```
POST {{base_url}}/api/auth/login
Body: { email, password }
Simpan token dari response
```

#### Step 3: Set Token
Tambahkan token ke Authorization header:
```
Authorization: Bearer {{token}}
```

#### Step 4: Test Protected Endpoints
```
GET {{base_url}}/api/students
POST {{base_url}}/api/students
PUT {{base_url}}/api/students/{id}
DELETE {{base_url}}/api/students/{id} (requires ADMIN)
```

### Screenshot Testing
Capture screenshots untuk:
1. ✅ Register success
2. ✅ Login success (with token)
3. ✅ GET request dengan token valid
4. ✅ POST request membuat data
5. ✅ PUT request update data
6. ✅ DELETE request (as ADMIN)
7. ✅ Error: Access without token (401)
8. ✅ Error: USER trying to DELETE (403)

---

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka [https://vercel.com](https://vercel.com)
2. Import repository dari GitHub
3. Tambahkan Environment Variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV=production`
4. Deploy!

### 3. Test Production API
```
https://your-app.vercel.app/api/auth/login
```

---

## 📊 Bonus Features (Optional)

### ✅ Pagination
Sudah diimplementasikan di semua GET endpoints:
```
GET /api/students?page=1&limit=10
```

### ⏰ Logging (Optional)
Tambahkan logging middleware untuk track requests

### 🔄 Rate Limiting (Optional)
Implementasi rate limiting untuk prevent abuse

### 🎯 Refresh Token (Optional)
Implementasi refresh token mechanism

---

## 🐛 Troubleshooting

### Error: Connection to database failed
- Cek DATABASE_URL di .env
- Pastikan Supabase project aktif
- Cek firewall/network connection

### Error: Invalid token
- Token expired (generate baru dengan login)
- JWT_SECRET berbeda dari saat generate
- Format header salah (harus: `Bearer <token>`)

### Error: Prisma Client not generated
```bash
npx prisma generate
```

### Error: Migration failed
```bash
# Reset database (HATI-HATI: menghapus semua data)
npx prisma migrate reset

# Atau push ulang
npx prisma db push --force-reset
```

---

## 👨‍💻 Developer

**Nama**: [Nama Anda]
**NIM**: [NIM Anda]
**Kelas**: [Kelas Anda]
**Mata Kuliah**: Pemrograman API
**Dosen**: Saiful Nur Budiman, S.Kom., M.Kom

---

## 📝 Lisensi

Project ini dibuat untuk keperluan UAS Pemrograman API - Universitas Islam Balitar.

---

## 📧 Kontak

Jika ada pertanyaan, hubungi:
- Email: [email-anda]
- GitHub: [github-username]

---

**⭐ Star this repository if you find it helpful!**
