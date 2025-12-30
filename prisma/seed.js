import {fakerID_ID} from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { EnrollmentStatus } from "@prisma/client";

/**
 * @type {import("@prisma/client").PrismaClient} 
 */
const prisma = new PrismaClient(
    {
        datasources:{
            db: {
                url: process.env.DIRECT_URL 
            }
        }
    }
);

const user_count = 100; // user count must be higher than courses length
const nim_prefix = 231044100;
const year = new Date().getFullYear();

const major_and_courses = new Map([
    ["Teknik Informatika", new Map([
        ["Pemrograman API", new Map()],
        ["Pemrograman Web", new Map()],
        ["Statistika", new Map()],
        ["Kecerdasan Buatan", new Map()]
    ])],
    ["Sistem Informasi", new Map([
        ["Pemrograman", new Map()],
        ["Basis Data", new Map()],
        ["Jaringan Komputer", new Map()],
        ["Manajemen Proyek", new Map()]
    ])]
]);

const randomMajor = (function (){
    const major = [...major_and_courses.keys()];

    return function(){
        return major[Math.floor(Math.random() * major.length)];
    }
})();

const walkingNim = (function*(){
    let start = nim_prefix;
    
    while(true){
        yield ++start;
        
        if (start === Number.MAX_SAFE_INTEGER)
            start = nim_prefix;
    }
})();

let i = 0;
for(const val of major_and_courses.values()){
    for(const val2 of val.values()){
        val2.set("code", "00" + ++i);
        val2.set("credits", (Math.max(2,Math.floor(Math.random()*3) + 1)));
        val2.set("semester", (Math.floor(Math.random()*8) + 1));
    }
}


function userfactory(){
    const name = fakerID_ID.person.fullName();
    return{
        name,
        email : fakerID_ID.internet.email({firstName: name.split(" ")[0]}),
        password : fakerID_ID.internet.password({length:7})
    }
}

function studentfactory(name, createdbyUserid){
    const semester = Math.floor(Math.random()*8) + 1;
    return{
        nim: (walkingNim.next().value).toString(),
        name,
        major: randomMajor(),
        semester,
        enrollmentYear : Math.floor(year - semester/2),
        createdById: createdbyUserid
    }
}

function coursesfactory(){
    const res = [];
    for(const val of major_and_courses.values()){
        const arr = Array.from(val.entries());
        arr.map(([name,value]) => {
            res.push({
                name,
                code: value.get("code"),
                credits: value.get("credits"),
                semester: value.get("semester")
            });
        });
    }
    return res;
}

const enrollmentfactory = (function(){
    const enrollstatus = Array.from(EnrollmentStatus);

    return function(studentId, courseId){
        return{
            status: enrollstatus[Math.floor(Math.random()*enrollstatus.length)],
            studentId,
            courseId
        }
    }
})();
async function main(){

    
    console.log('seeding user...');
    const users = await prisma.user.createManyAndReturn(
        {
            data: Array.from({length:user_count},() => userfactory()),
            select:{
                id:true,
                name:true
            }
        }
    );
    console.log('seeding user selesai ....');


    const rawcourse_data = coursesfactory();
    const studentgroup = users.length - rawcourse_data.length;



    console.log(`seeding ${studentgroup} student...`);
    const students = await prisma.student.createManyAndReturn({
        data: Array.from({length: studentgroup}, (_, i) => 
            studentfactory(users[i].name, users[i].id)
        ),
        select: {
            id: true,
        }
    });
    console.log(`seeding student selesai`);

    console.log(`seeding ${rawcourse_data.length} course...`);

    rawcourse_data.forEach((v,i,_)=>{
            v.instructorId = users[studentgroup+i].id;
        });

    const courses = await prisma.course.createManyAndReturn({
        data: rawcourse_data,
        select:{
            id:true
        }
    });
    console.log(`seeding course selesai`);


    console.log(`seed ${studentgroup} Enrollment`);
    const enrolls = await prisma.enrollment.createMany({
        data: Array.from({length:students.length}, (_,i) => 
            enrollmentfactory(
                students[i].id,
                courses[Math.floor(Math.random()*courses.length)].id
            )
        )
    });

    console.log(`seeding enrollment selesai`);
          

}

main()
.then(()=>console.log("seed berhasil dijalankan"))
.catch(e => console.error(`seed ERROR : ${e}`))
.finally(()=>prisma.$disconnect());