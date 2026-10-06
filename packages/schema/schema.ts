import {z} from 'zod';



// zod schema for runtime validation 
export const UserSchema = z.object({
    username: z.string(),
    password: z.string()
});




// typescript type for compile time safety 
export type User = z.infer<typeof UserSchema>