// "use client";
// import { useState, useEffect } from "react";
// import { WS_URL } from "../app/config";

// export function useSocket() {
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<WebSocket>();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     const ws = new WebSocket(`${WS_URL}?token=${token}`);
//     let active = true;

//     ws.onopen = () => {
//       if (!active) return;
//       setSocket(ws);
//       setLoading(false);
//     };
//     ws.onclose = () => {
//       if (active) setSocket(undefined);
//     };

//     return () => {
//       active = false;
//       ws.close();
//     };
//   }, []);

//   return { socket, loading };   // <- ye line hook ke sabse neeche, useEffect ke BAHAR
// }




"use client";

import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    const ws = new WebSocket(
      `${WS_URL}?token=${encodeURIComponent(token)}`
    );

    console.log("Creating WebSocket connection");

    ws.onopen = () => {
      console.log("WebSocket connected");

      if (!active) return;

      setSocket(ws);
      setLoading(false);
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    ws.onclose = (event) => {
      console.log(
        "WebSocket closed:",
        event.code,
        event.reason
      );

      if (!active) return;

      setSocket(undefined);
      setLoading(false);
    };

    return () => {
      active = false;
      ws.close();
    };
  }, []);

  return { socket, loading };
}
