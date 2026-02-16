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
  const terminalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount and keep focus
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Click anywhere on terminal to refocus textarea
  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, cmd]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      setCmd(prev => prev.slice(0, -1));
      return;
    }

    // Handle enter
    if (e.key === "Enter") {
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
      return;
    }

    // Handle regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setCmd(prev => prev + e.key);
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
    <div onClick={focusTextarea} className="relative w-screen h-screen bg-black text-green-400 font-mono overflow-hidden cursor-text" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Terminal Header */}
      <div className="bg-gray-900 px-4 py-3 border-b-2 border-gray-700 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2">WebShell: ~</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Terminal Output Area - Text Flow Layout */}
      <div 
        ref={terminalRef}
        className="overflow-y-auto h-[calc(100%-53px)] p-4 relative"
      >
        <div className="inline whitespace-normal break-normal text-xs leading-relaxed">
          {/* Welcome message */}
          {history.length === 0 && (
            <>
              <span className="text-green-600">Welcome to Terminal v1.0.0</span>
              <br />
              <span className="text-green-600">Type 'help' for available commands</span>
              <br />
              <br />
            </>
          )}

          {/* History lines */}
          {history.map((line, index) => (
            <React.Fragment key={index}>
              {line.type === "command" ? (
                <>
                  <span className="text-cyan-400">WebShell:~$</span>
                  <span className="text-green-400"> {line.content}</span>
                </>
              ) : line.type === "error" ? (
                <span className="text-red-400">{line.content}</span>
              ) : (
                <span className="text-green-400">{line.content}</span>
              )}
              <br />
            </React.Fragment>
          ))}

          {/* Current input line */}
          <span className="text-cyan-400">WebShell:~$</span>
          <span className="text-green-400"> {cmd}</span>
          <span className="text-green-400 animate-pulse">▌</span>

          {/* Screen reader text */}
          <span className="sr-only">Terminal prompt, type commands here</span>
        </div>
      </div>

      {/* Ghost Textarea - Hidden input capture */}
      <textarea
        ref={textareaRef}
        className="absolute right-px bottom-px -z-10 h-px w-px opacity-0"
        value={cmd}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        autoFocus
        spellCheck="false"
        style={{ fontSize: "1px" }}
      />
    </div>
  );
}
