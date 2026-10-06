import jwt from 'jsonwebtoken';


export const  JWT_SECRET = "abdulajij427"
const generateToken = (id: number): string=>{
    return jwt.sign({id}, JWT_SECRET);
};

export default generateToken;