"use client";

import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {HTTP_BACKEND} from "@/config";


export default function Dashboard(){
    const router = useRouter();
    const [slug , setSlug] = useState("");
    const [error , setError] = useState("");

    async function go(mode: "create" | "join"){
        setError("");
        const token = localStorage.getItem("token");
        if(!token){
            return router.push("/signin");
        }
        const headers = {Authentication: `Bearer ${token}`};
        try{
            const res = 
            mode === "create"
            ? await axios.post(`${HTTP_BACKEND}/room`, {name: slug}, {headers})
            : await axios.post(`${HTTP_BACKEND}/room/${slug}/join`, {}, {headers});
         router.push(`/canvas/${res.data.roomId}`);   
        }catch(e: any){
            setError(e.response?.data?.message ?? "Failed");
        }
    }

    return(
        <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-6 bg-white rounded flex flex-col gap-3">
            <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Room name"
            className="border rounded px-3 py-2"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2">
            <button onClick={() => go("create")} className="border rounded px-3 py-1">
                Create room
            </button>
            <button onClick={() => go("join")} className="border rounded px-3 py-1">
                Join room
            </button>
            </div>
        </div>
        </div>
    )
}