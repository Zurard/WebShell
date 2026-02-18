'use client';

import { useEffect, useRef, useState } from "react";

interface StructuredOutput {
  format: "text" | "list" | "table" | "json" | "path" | "success" | "error";
  content: string | string[] | Record<string, string>;
  metadata?: {
    itemCount?: number;
    isEmpty?: boolean;
  };
}

interface WebSocketMessage {
  type: 'clear' | 'output' | 'error';
  data?: string;
  structured?: StructuredOutput;
  timestamp?: number;
}

export interface ProcessedMessage {
  type: 'clear' | 'output' | 'error';
  data: string;
  structured?: StructuredOutput;
}

export function useWebSocket(url :string) {
    const [command, setMessages] = useState<ProcessedMessage[]>([])
    const [isConnected ,setIsConnected] = useState<boolean>(false)
    const [sessionId, setSessionId] = useState<string>("")
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
            
            // Extract session ID from initial connection message
            if (message.data?.startsWith("Connected with session:")) {
              const extractedSessionId = message.data.replace("Connected with session: ", "");
              setSessionId(extractedSessionId);
              console.log("Session established:", extractedSessionId);
            }
            
            const processedMessage: ProcessedMessage = {
              type: message.type,
              data: message.data || "",
              structured: message.structured
            };
            
            switch(message.type) {
                case 'clear':
                    setMessages([]);
                    break;
                case 'output':
                    setMessages((prev) => [...prev, processedMessage]);
                    break;  
                case 'error':
                    setMessages((prev) => [...prev, processedMessage]);
                    break;
            }
        }

        ws.onerror = (error) => {
            const errorMessage: ProcessedMessage = {
              type: 'error',
              data: `Error: ${error}`
            };
            setMessages((prev) => [...prev, errorMessage]);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
            setSessionId("");
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
        sessionId,
        sendCommand
    }
}