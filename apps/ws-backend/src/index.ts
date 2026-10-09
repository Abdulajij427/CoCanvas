import {WebSocketServer} from 'ws';
import jwt , {type JwtPayload} from "jsonwebtoken";
import JWT_SECRET from '@repo/backend-common';


const wss = new WebSocketServer({port:8000});

function checkUser(token: string): number | null{
    try{
        const decoded = jwt.verify(token , JWT_SECRET);
        if(typeof decoded === "string" || !decoded.id ) return null;
        return decoded.id;
    }catch{
        return null;
    }
}


wss.on('connection' , function connection(ws ,request){

    ws.on('error', console.error);

    const url = request.url;
    if(!url){
        ws.close();
        return;
    }

    const queryParam = new URLSearchParams(url.split('?')[1]);
    const token = queryParam.get("token") || "";
    const userId = checkUser(token);

    if(userId === null){
        ws.close(1008, "Unauthorized");
        return;
    }


    ws.on("message" , function message(data){
        ws.send('pong');
    });



});