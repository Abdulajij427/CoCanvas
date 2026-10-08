import {Pool} from 'pg';
import path from "path";
import {fileURLToPath} from 'url';
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// build ke baad file dist/db.js me hogi, isliye ek folder upar
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});






// store username , password
export async function CreateUserTable(){
    
    try{
    return await pool.query(
        `
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
        );
        `
        
    );
    console.log("user table created");
    }catch(error){
        console.error("error creating table:",error)
        throw error;
    }
}



export async function CreateRoomTable(){
    return await pool.query(
        `
        CREATE TABLE IF NOT EXISTS rooms(
            id SERIAL PRIMARY KEY,
            slug VARCHAR(200) UNIQUE NOT NULL,
            admin_id INT NOT NULL REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
        );
        `
    );
    console.log("rooms table created");
}



export async function CreateRoomMemberTable(){

    return await pool.query(
        `
        CREATE TABLE room_members(
            room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (room_id , user_id)
        );
        `
    )
    console.log("room_members table created");
}



export async function CreateChatsTable(){
    return await pool.query(
        `
        CREATE TABLE IF NOT EXISTS chats(
            id SERIAL PRIMARY KEY,
            room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        `
    );
    console.log(
        "chats table created "
    )
}




