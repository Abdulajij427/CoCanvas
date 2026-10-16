import {WS_URL}from "@/config";
import {initDraw} from "@/draw";
import {useEffect , useRef , useState} from "react";
import {Canvas} from "./canvas"


export function RoomCanvas({roomId}: {roomId: string}){
    const [socket , setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const ws = new WebSocket(WS_URL)

        ws.onopen = ()=>{
            setSocket(ws);
            const data = JSON.stringify({
                type:"join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }

    },[])

    if(!socket){
        return(
            <div>
                connecting to server...
            </div>
        )
    }


    return (
        <div>
            <Canvas roomId={roomId}/>
        </div>
    )
}