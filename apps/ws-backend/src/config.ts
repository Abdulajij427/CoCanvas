import jwt from 'jsonwebtoken';
import JWT_SECRET from '@repo/backend-common'


const generateToken = (id: number): string=>{
    return jwt.sign({id}, JWT_SECRET);
};

export default generateToken;