import express from 'express';
import mainRouter from './routes/index.js'
import cors from 'cors';
import {CreateUserTable , CreateRoomTable , CreateRoomMemberTable} from '@repo/db'


const app = express();
app.use(cors());
app.use(express.json());


app.use('api/v1' , mainRouter);

   await CreateUserTable();
   await CreateRoomTable();
   await CreateRoomMemberTable();


const PORT = process.env.PORT || 3000;
app.listen(PORT , ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})