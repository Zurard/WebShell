'use client';

import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: 'clear' | 'output' | 'error';
  data: string;
}

export function useWebSocket(url :string) {
    const [command, setCommand] = useState<string[]>([])
    const [isConnected ,setIsConnected] = useState<boolean>(false)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(( )=> {
        // Now we create the web socket connection 
        const ws = new WebSocket(url);
        wsRef.current = ws;
    
        ws.onopen = () =>{
            console.log("Connected to Websocket");
            setIsConnected(true);
        }
        
    //received command from the client and we need to execute it and send the output back to the client
        ws.onmessage = (event) => {
            const command :WebSocketMessage = JSON.parse(event.data);
            console.log("Received command:", command);
            switch(command.type) {
                case 'clear':
                    setCommand([]);
                    break;
                case 'output':
                    setCommand((prev) => [...prev, command.data]);
                    break;
                case 'error':
                    setCommand((prev) => [...prev, `Error: ${command.data}`]);
                    // console.error("WebSocket error:", command.data);
                    break;
            }
        }

        ws.onerror = (error) => {
            console.error("WebSocket error", error);
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