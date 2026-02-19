'use client';

import { useEffect, useRef, useState, useCallback } from "react";

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

interface UseWebSocketOptions {
  onMessage?: (message: ProcessedMessage) => void;
  onClear?: () => void;
}

export function useWebSocket(url: string, options?: UseWebSocketOptions) {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>("");
    const wsRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(options?.onMessage);
    const onClearRef = useRef(options?.onClear);

    // Keep refs up to date without re-running the effect
    useEffect(() => {
        onMessageRef.current = options?.onMessage;
        onClearRef.current = options?.onClear;
    }, [options?.onMessage, options?.onClear]);

    useEffect(() => {
        const instanceId = Math.random().toString(36).slice(2, 9);
        console.log(`[WebSocket Hook ${instanceId}] Creating new connection to ${url}`);

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`[WebSocket Hook ${instanceId}] Connected to Websocket`);
            setIsConnected(true);
        };

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

            if (message.type === 'clear') {
                onClearRef.current?.();
            } else {
                onMessageRef.current?.(processedMessage);
            }
        };

        ws.onerror = (error) => {
            console.log(`[WebSocket Hook ${instanceId}] Error:`, error);
            onMessageRef.current?.({
                type: 'error',
                data: `Connection error`
            });
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

    const sendCommand = useCallback((command: string) => {
        if (isConnected && wsRef.current) {
            console.log(`[sendCommand] Sending:`, command);
            wsRef.current.send(command);
        } else {
            console.error("WebSocket is not connected");
        }
    }, [isConnected]);

    return {
        isConnected,
        sessionId,
        sendCommand
    };
}