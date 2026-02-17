// in this we actaully execute the command and return the output to the client

import { parseCommand } from "./parser.js";
import { getCommand } from "./registry.js";
import { type ShellState} from "./state.js";
import type { StructuredOutput } from "@webshell/shared/src/types.js";

export interface CommandOutput {
  success: boolean;
  message: string;
  structured?: StructuredOutput;
}

export const executeCommand = (command: string, state: ShellState): CommandOutput => {
    const { parsedCommand } = parseCommand(command);
    if (!parsedCommand) {
        return { success: true, message: "", structured: { format: "text", content: "" } };
    }

    const handler = getCommand(parsedCommand.cmd);
    const cmdName = parsedCommand.cmd.toLowerCase();

    if (!handler) {
        return { 
          success: false, 
          message: `Command not found: ${parsedCommand.cmd}`,
          structured: { format: "error", content: `Command not found: ${parsedCommand.cmd}` }
        };
    }

    const result = handler(parsedCommand.args, state);
    
    if (typeof result === "string") {
        state.history.push(command);
    }

    // Format structured output based on command type
    let structured: StructuredOutput;

    if (result?.startsWith("error:")) {
      structured = { format: "error", content: result.replace("error: ", "") };
    } else if (result?.startsWith("✓")) {
      structured = { format: "success", content: result };
    } else if (cmdName === "scan") {
      // Format ls/scan output as list
      const items = result ? result.split("\n").filter(Boolean) : [];
      structured = { 
        format: "list", 
        content: items,
        metadata: { itemCount: items.length, isEmpty: items.length === 0 }
      };
    } else if (cmdName === "help") {
      // Format help as list of commands
      const lines = result ? result.split("\n") : [];
      const commands = lines
        .filter(line => line.includes("-"))
        .map(line => line.trim())
        .filter(Boolean);
      structured = { 
        format: "list", 
        content: commands,
        metadata: { itemCount: commands.length }
      };
    } else if (cmdName === "pwd") {
      // Format pwd as path
      structured = { format: "path", content: result || "/" };
    } else {
      // Default text format
      structured = { format: "text", content: result || "" };
    }

    return {
      success: !result?.startsWith("error:"),
      message: result || "",
      structured
    };
}

// const state = InitialShellState;
// console.log(executeCommand("mkdir test", state));
// console.log(executeCommand("ls", state));
// console.log(executeCommand("cd test", state));
// console.log(state.cwd.name);  // Should be "test"