import jwt from 'jsonwebtoken';
import JWT_SECRET from '@repo/backend-common'

//export const  JWT_SECRET = "abdulajij427"
const generateToken = (id: number): string=>{
    return jwt.sign({id}, JWT_SECRET);
};

export default generateToken;