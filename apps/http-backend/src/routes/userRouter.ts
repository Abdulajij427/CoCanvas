import {Router , type Request , type Response} from 'express';
import bcrypt from 'bcrypt'
import {userSchema} from '../../../packages/db/schema.js'


const userRouter: Router = Router();

userRouter.post("/signup", async (req:Request , res: Response)=>{
    const {username , password} = req.body;

    const hashedPassword = bcrypt.hash(password , 10);

    if(username){
        return res.status(403).json({message: "username is already taken"});

    } else{
        return res.status(200).json({message:" username is created successfully"});
    }
});



export default userRouter;