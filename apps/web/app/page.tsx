"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';


import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";



export default function Home() {
  const [roomId , setRoomId] = useState("");
  const router = useRouter();
  
  return (
    <div style={{
      display: "flex",
      justifyContent : "center",
      alignItems :"center",
      height: "100vh",
      width: "100vh"
    }}>
      <div>
        <input style={{
          padding: 10
        }} value={roomId} onChange={(e)=>{
          setRoomId(e.target.value);
        }} type="text" placeholder="Room id"/>

        <button style={{padding:10}} onClick={()=>{
          router.push(`/room/${roomId}`);
        }}>
          Join room
        </button>
      </div>
    </div>
  );
}
