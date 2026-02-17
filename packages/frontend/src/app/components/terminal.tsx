"use client";
import React, { useState, useRef, useEffect } from "react";
import { useWebSocket, type ProcessedMessage } from "../hooks/webSocket";

interface TerminalLine {
  type: "command" | "output" | "error";
  content: string;
  message?: ProcessedMessage;
}

// Component to render structured output
const OutputRenderer: React.FC<{ message: ProcessedMessage }> = ({ message }) => {
  if (!message.structured) {
    return <span className="text-green-400">{message.data}</span>;
  }

  const { format, content, metadata } = message.structured;

  // Helper to convert content to string if it's an object
  const contentToString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join("\n");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  switch (format) {
    case "list":
      if (Array.isArray(content) && content.length > 0) {
        return (
          <div className="text-green-400 space-y-1">
            {content.map((item, i) => (
              <div key={i} className="flex items-start gap-3 pl-2">
                <span className="text-cyan-400 font-semibold">→</span>
                <span className="hover:bg-gray-800 transition-colors px-2 rounded cursor-pointer">
                  {item}
                </span>
              </div>
            ))}
            {metadata?.itemCount && (
              <div className="text-gray-500 text-xs pt-2 pl-2">
                ({metadata.itemCount} item{metadata.itemCount !== 1 ? 's' : ''})
              </div>
            )}
          </div>
        );
      }
      if (content && Array.isArray(content) && content.length === 0) {
        return <span className="text-gray-500 italic">No items to display</span>;
      }
      return <span className="text-green-400">{contentToString(content)}</span>;

    case "path":
      return (
        <div className="text-blue-300 bg-gray-900 px-3 py-2 rounded border border-blue-400">
          <span className="font-mono text-sm">{contentToString(content)}</span>
        </div>
      );

    case "success":
      return (
        <div className="text-green-500 flex items-center gap-2 font-semibold">
          <span className="text-lg">✓</span>
          <span>{contentToString(content).replace(/^✓\s*/, '')}</span>
        </div>
      );

    case "error":
      return (
        <div className="text-red-400 flex items-center gap-2 font-semibold">
          <span className="text-lg">✗</span>
          <span>{contentToString(content).replace(/^✗\s*/, '')}</span>
        </div>
      );

    case "table":
      if (typeof content === "object" && !Array.isArray(content)) {
        return (
          <div className="text-green-400">
            <div className="border border-green-400 rounded overflow-hidden">
              <div className="bg-green-900 bg-opacity-30 grid grid-cols-2">
                {Object.entries(content).map(([key, value], idx) => (
                  <React.Fragment key={key}>
                    <div className={`px-4 py-2 border-r border-green-400 font-semibold text-yellow-400 ${idx % 2 === 1 ? 'border-b border-green-400' : ''}`}>
                      {key}
                    </div>
                    <div className={`px-4 py-2 ${idx % 2 === 1 ? 'border-b border-green-400' : ''}`}>
                      {value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return <span className="text-green-400">{contentToString(content)}</span>;

    case "json":
      return (
        <pre className="text-green-400 bg-gray-900 border border-gray-700 p-3 rounded overflow-x-auto text-xs font-mono">
          {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
        </pre>
      );

    default:
      return <span className="text-green-400 whitespace-pre-wrap">{contentToString(content)}</span>;
  }
};

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
      console.log("New message received:", lastMsg);
      
      setHistory(prev => [...prev, { 
        type: lastMsg.type === "error" ? "error" : "output", 
        content: lastMsg.data,
        message: lastMsg
      }]);
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

      {/* Terminal Output Area */}
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
                <>
                  <span className="text-red-400">{line.content}</span>
                </>
              ) : line.message ? (
                <OutputRenderer message={line.message} />
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
