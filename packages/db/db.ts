import {Pool} from 'pg';

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
        username VARCHAR(100) NOT NULL,
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
        CREATE TABLE rooms(
        id SERIAL PRIMARY KEY,
        slug VARCHAR(200) UNIQUE NOT NULL,
        admin_id INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
        );
        `
    );
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
}



export async function CreateChatsTable(){
    return await pool.query(
        `
        CREATE TABLE chats (
        id SERIAL PRIMARY KEY,
        room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
        );
        `
    )
}




