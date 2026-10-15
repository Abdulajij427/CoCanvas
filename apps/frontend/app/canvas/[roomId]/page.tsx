"use client"
import {useEffect , useRef} from "react";
import {initDraw} from "@/draw";



export default function Canvas(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(()=>{
        const canvasRef = useRef<HTMLCanvasElement>(null);
        if(canvasRef.current){
            initDraw(canvasRef.current);
        }

            
        

    }, [canvasRef]);
    
    return(
        <div>
            <canvas ref={canvasRef} width={500} height={500} className="bg-white"></canvas>    
        </div>
    )
}