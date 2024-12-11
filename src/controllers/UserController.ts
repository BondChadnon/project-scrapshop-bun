import { PrismaClient } from "@prisma/client";
import { password } from "bun";

const prisma = new PrismaClient()

export const UserController={
    sigIn :async({body,jwt}:{
        body:{
            username:string
            password:string
        }, jwt : any
    })=>{
        try{
            const user = await prisma.user.findUnique({
                select:{
                    id:true,
                    username:true,
                    level:true
                },where :{
                    username:body.username,
                    password:body.password,
                    status:"active"
                }
            })
            if(!user){
                return{message:"Invalid Username or Password"}
            }
            const token = await jwt.sign(user)
            return {user,token}
        }catch(error){
            return error
        }
    },
    update:async({body,request,jwt}:{
        body:{
            username:string
            password:string
        },request:any,jwt:any
    })=>{
            try{
                const headers = request.headers.get("Authorization")
                const token = headers?.split(" ")[1]
                console.log(headers)
                const payload = await jwt.verify(token)
                const id= payload.id
                const oldUser = await prisma.user.findUnique({
                    where:{id}
                })
                const newData ={
                    username :body.username,
                    password :body.password??  oldUser?.password
                }

                await prisma.user.update({
                    where:{id},
                    data:newData

                })
                return {message:'success'}
        }catch (error){
            return error
        }
    }
}