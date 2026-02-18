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
        // Generate unique ID for this component instance
        const instanceId = Math.random().toString(36).slice(2, 9);
        console.log(`[WebSocket Hook ${instanceId}] Creating new connection to ${url}`);
        
        // Now we need to create the web socket connection 
        const ws = new WebSocket(url);
        wsRef.current = ws;
        
        console.log(`[WebSocket Hook ${instanceId}] WebSocket object created`, ws);
    
        ws.onopen = () =>{
            console.log(`[WebSocket Hook ${instanceId}] Connected to Websocket`);
            setIsConnected(true);
        }
        
        ws.onmessage = (event) => {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log(`[WebSocket Hook ${instanceId}] Received message:`, message);
            
            // Extract session ID from initial connection message
            if (message.data?.startsWith("Connected with session:")) {
              const extractedSessionId = message.data.replace("Connected with session: ", "");
              setSessionId(extractedSessionId);
              console.log(`[WebSocket Hook ${instanceId}] Session established:`, extractedSessionId);
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
            console.log(`[WebSocket Hook ${instanceId}] Error:`, error);
            const errorMessage: ProcessedMessage = {
              type: 'error',
              data: `Error: ${error}`
            };
            setMessages((prev) => [...prev, errorMessage]);
        };

        ws.onclose = () => {
            console.log(`[WebSocket Hook ${instanceId}] WebSocket connection closed`);
            setIsConnected(false);
            setSessionId("");
        };

        return () => {
            console.log(`[WebSocket Hook ${instanceId}] Cleaning up - closing WebSocket`);
            ws.close();
        };
    }, [url]);

const sendCommand = (command: string) => {
    if (isConnected && wsRef.current) {
        console.log(`[sendCommand] Sending:`, command);
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