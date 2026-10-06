import {NextFunction , Request , Response} from 'express';
import jwt , { type JwtPayload} from 'jsonwebtoken';
import JWT_SECRET from '@repo/backend-common';


export function middleware(req: Request , res: Response , next: NextFunction){
    const authHeader = req.headers.authorization;

    const token = authHeader?.split("")[1];

    if(!token){
        return res.status(411).json({message:"token missing"})
    }

    const decoded  = jwt.verify(token , JWT_SECRET) as JwtPayload;

    try{
    if(decoded){
        (req as any).userId = decoded.id;
        next();
    }
    }catch(error){
        return console.error("the error occured", error)
        
    }


}