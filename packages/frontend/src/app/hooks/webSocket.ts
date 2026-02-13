'use client';

import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: 'clear' | 'output' | 'error';
  data: string;
}

export function useWebSocket(url :string) {
    const [command, setMessages] = useState<string[]>([])
    const [isConnected ,setIsConnected] = useState<boolean>(false)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(( )=> {
        // Now we need to create the web socket connection 
        const ws = new WebSocket(url);
        wsRef.current = ws;
    
        ws.onopen = () =>{
            console.log("Connected to Websocket");
            setIsConnected(true);
        }
        
        ws.onmessage = (event) => {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log("Received message:", message);
            switch(message.type) {
                case 'clear':
                    setMessages([]);
                    break;
                case 'output':
                    setMessages((prev) => [...prev, message.data]);
                    break;  
                case 'error':
                    // console.error("WebSocket error:", message.data);
                    setMessages((prev) => [...prev, `Error: ${message.data}`]);
                    break;
            }
        }

        ws.onerror = (error) => {
            // console.error("WebSocket error", error);
            setMessages((prev) => [...prev, `Error: ${error}`]);
        };


        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [url]);

const sendCommand = (command: string) => {
    if (isConnected && wsRef.current) {
        wsRef.current.send(command) ;
    }else{
        console.error("WebSocket is not connected");
    } 
};
    return {
        command,
        isConnected,
        sendCommand
    }
}