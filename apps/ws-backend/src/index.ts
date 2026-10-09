import {WebSocketServer , WebSocket} from 'ws';
import jwt , {type JwtPayload} from "jsonwebtoken";
import JWT_SECRET from '@repo/backend-common';


const wss = new WebSocketServer({port:8000});


interface User {
    userId : string | number,
    rooms: string[],
    ws : WebSocket
}


const  users: User[] = [];

function checkUser(token: string): number | null{
    try{
        const decoded = jwt.verify(token , JWT_SECRET);
        if(typeof decoded === "string" || !decoded.id) return null;
        return decoded.id;
    }catch{
        return null;
    }
}



wss.on("connection", function connection(ws , request){
    ws.on('error' , console.error);

    const url = request.url;
    if(!url){
        ws.close();
        return;
    }

    const queryParam = new URLSearchParams(url.split('?')[1]);
    const token = queryParam.get("token") || "";
    const userId  = checkUser(token);

    if(userId === null){
        ws.close(1008 , "Unauthorized");
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on("message" , function message(data){
        const parsedData = JSON.parse(data as unknown as string); // {type : "join-room" , roomId: 1}

        if(parsedData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            users.forEach(user => {
                user.ws.send(JSON.stringify({
                    type: "chat",
                    message: message,
                    roomId
                }))
            })
        }
    });
});




