"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWebSocket } from "../hooks/webSocket";

interface TerminalLine {
  type: "command" | "output" | "error";
  content: string;
}

export default function Terminal() {
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const { command, isConnected, sendCommand } = useWebSocket('ws://localhost:8080');
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = cmd.trim();
    if (trimmed) {
      // Handle clear command
      if (trimmed.toLowerCase() === "clear") {
        setHistory([]);
        setCmd("");
        return;
      }
      
      // Add command to history
      setHistory(prev => [...prev, { type: "command", content: trimmed }]);
      sendCommand(trimmed);
      setCmd("");
    }
  };

  // Add incoming messages to history
  useEffect(() => {
    if (command.length > 0) {
      const lastMsg = command[command.length - 1];
      console.log("New command received:", lastMsg);
      if (lastMsg.startsWith("Error: ")) {
        setHistory(prev => [...prev, { type: "error", content: lastMsg.replace("Error: ", "") }]);
      } else {
        setHistory(prev => [...prev, { type: "output", content: lastMsg }]);
      }
    }
  }, [command]);

  return (
    <div className="h-screen w-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Terminal Header - Ubuntu Style */}
      <div className="bg-gray-900 px-4 py-3 border-b-2 border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2">shree@desktop: ~</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Unified Terminal Output and Input */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto bg-black p-4 flex flex-col"
      >
        {history.length === 0 && (
          <div className="text-green-600 text-xs leading-relaxed">
            Welcome to Terminal v1.0.0<br/>
            Type 'help' for available commands<br/>
            <br/>
          </div>
        )}
        
        {history.map((line, index) => (
          <div key={index} className="mb-0">
            {line.type === "command" ? (
               <div className="text-green-400 text-xs leading-relaxed">
                <span className="text-cyan-400">shree@desktop:~$</span> <span>{line.content}</span>
              </div>
            ) : (
              <div className="text-green-400 text-xs leading-relaxed whitespace-pre-wrap wrap-break-words">
                {line.content}
              </div>
            )}
          </div>
        ))}

        {/* Input form inline with output */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-1 mt-auto">
          <span className="text-cyan-400 shrink-0 text-xs">WebShell./:~$</span>
          <input
            ref={inputRef}
            className="flex-1 bg-black border-0 outline-none text-green-400 text-xs"
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            spellCheck="false"
            style={{
              caretColor: '#4ade80',
              fontSize: '0.75rem',
            }}
          />
          <span className="text-green-400 animate-pulse text-xs">▌</span>
        </form>
      </div>
    </div>
  );
}
