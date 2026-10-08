import {z} from 'zod';



// zod schema for runtime validation 
export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    name: z.string()
});

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
})



export const RoomSchema = z.object({
    name: z.string().min(3)
})




// typescript type for compile time safety 
export type User = z.infer<typeof UserSchema>
export type Signin = z.infer<typeof SigninSchema>
export type Room = z.infer<typeof RoomSchema>