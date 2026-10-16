"use client"
import {useRef , useEffect , useState} from "react";
import {initDraw} from "@/draw";
import {WS_URL}  from '@/config';

export function Canvas({roomId}: {roomId: string}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
        
    useEffect(()=>{
        if(canvasRef.current){
            const socket = new WebSocket(WS_URL);
            initDraw(canvasRef.current , roomId , socket);
            return () => socket.close();
        }
    }, [roomId]);
        return(
            <div>
                <canvas ref={canvasRef} width={500} height={500}></canvas>  
                <div className="absolute bottom-0 right-0">
                    <button>Rect</button>
                    <button>Circle</button>
                </div>  
            </div>
        )
}