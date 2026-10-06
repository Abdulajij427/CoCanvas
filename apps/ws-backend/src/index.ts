import {WebSocketServer} from 'ws';
import jwt , {type JwtPayload} from "jsonwebtoken";
import {JWT_SECRET} from './config.js'

const wss = new WebSocketServer({port:8000});

wss.on('connection', function connection(ws , request){
    const url = request.url;

    if(!url){
        return;
    }

    const queryParam = new URLSearchParams(url.split('?')[1]);
    
    const token:any = queryParam.get("token");
    
    const decoded = jwt.verify(token ,JWT_SECRET ) as JwtPayload;

    if(!decoded || !decoded.userId){
        ws.close();
        return;
    }
    
    
    

    ws.on("message", function message(data){
        ws.send('pong');
    });
});

