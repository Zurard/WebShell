// Maps command names to their handler functions

import type { FileNode, ShellState } from "./state";

type CommandHandler = (args: string[], state: ShellState) => string | void;

export const lsHandler: CommandHandler = (args, state) => {
  const currNode = state.cwd;

  if (currNode.type !== "directory") {
    return "Not a directory";
  }

  if (!currNode.children || currNode.children.length === 0) {
    return "";
  }

  return currNode.children.map((child) => child.name).join("\n");
};

export const mkdirHandler: CommandHandler = (args, state) => {
  if (!args[0]) {
    return "mkdir: missing directory name";
  }

  const dirName = args[0];
  const currNode = state.cwd;

  if (currNode.type !== "directory") {
    return "Current node is not a directory";
  }

  if (!currNode.children) {
    currNode.children = [];
  }

  if (currNode.children.some((child) => child.name === dirName)) {
    return `Directory "${dirName}" already exists`;
  }

  const newDir: FileNode = {
    id: `${currNode.id}-${Date.now()}`,
    name: dirName,
    type: "directory",
    parent: currNode,
    children: [],
  };

  currNode.children.push(newDir);

  return `Directory "${dirName}" created`;
};

export const cdHandler: CommandHandler = (args, state) => {
  if (!args[0]) {
    return "cd: missing directory name";
  }

  const targetName = args[0];
  const currNode = state.cwd;

  if (targetName === "..") {
    if (currNode.parent) {
      state.cwd = currNode.parent;
    }
    return;
  }

  if (currNode.type !== "directory" || !currNode.children) {
    return "Not a directory";
  }

  const target = currNode.children.find(
    (child) => child.name === targetName && child.type === "directory",
  );

  if (!target) {
    return `cd: no such directory: ${targetName}`;
  }

  state.cwd = target;
};

export const commandRegistry: Record<string, CommandHandler> = {
  ls: lsHandler,
  mkdir: mkdirHandler,
  cd: cdHandler,
};

export const getCommand = (commandName: string): CommandHandler | null => {
  return commandRegistry[commandName] || null;
};
