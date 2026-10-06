import {Router , type Request , type Response} from 'express';
import bcrypt from 'bcrypt'
import {User , UserSchema} from "@repo/schema"
import {pool} from "@repo/db"
import  generateToken from '../config.js'
import {middleware} from '../middleware/middleware.js'

const userRouter: Router = Router();

userRouter.post("/signup", async (req:Request , res: Response)=>{
    const parsed = UserSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(411).json({message:"username and password not valid"})
    }

    const {username , password} = parsed.data;
    
    try{
    const hashedPassword = bcrypt.hash(password , 10);

    const {rows} = await pool.query(
        `
        INSERT INTO users (username , password)
        VALUES ($1 , $2)
        RETURNING id
        `,
        [username , hashedPassword]
    );

    if(username){
        return res.status(403).json({message: "username is already taken"});

    } else{
        return res.status(200).json({message:" username is created successfully"});
    }
   }catch(error){
        console.error(error)
        return res.status(500).json({message: "server error"});
   }
});



userRouter.post("/signin", async (req:Request , res: Response)=>{
    const parsed = UserSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(411).json({message:"invalid input"})
    }
    const {username , password} = parsed.data;
    try{
        
        const {rows} = await pool.query(
            `
            SELECT id , password FROM users WHERE username = $1
            `,
            [username]
        );
        const userId = rows[0].id
        
        if(username){
            const token =  generateToken(userId)
            return res.status(200).json({message: "token created successfully" , token})
        }
    }catch(error){
        console.error("the error occured",error)
        throw error
    }
});







userRouter.get("/room", middleware , async (res: Response , req: Request)=>{
    //db call

    res.json({
        roomId : 123
    })
})


export default userRouter;