import {Pool} from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});






// store username , password
export async function users(){
    
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




