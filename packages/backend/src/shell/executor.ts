// in this we actaully execute the command and return the output to the client

import { parseCommand } from "./parser.ts";
import { getCommand } from "./registry.ts";
import { type ShellState} from "./state.ts";


export const executeCommand = (command: string, state: ShellState): string => {
    const { parsedCommand } = parseCommand(command);
    if (!parsedCommand) {
        return "";
    }

    const handler = getCommand(parsedCommand.cmd);

    if (!handler) {
        return `Command not found: ${parsedCommand.cmd}`;
    }

    const result  = handler(parsedCommand.args, state);
    
    if (typeof result === "string") {
        state.history.push(command);
    }

    
 return result || "";   
}

// const state = InitialShellState;
// console.log(executeCommand("mkdir test", state));
// console.log(executeCommand("ls", state));
// console.log(executeCommand("cd test", state));
// console.log(state.cwd.name);  // Should be "test"