// Maps command names to their handler functions

import type { FileNode, ShellState } from "./state";

type CommandHandler = (args: string[], state: ShellState) => string | void;

// Function to get the current working directory path as a string
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


// Function to create a new directory in the current working directory
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


/// Function to change the current working directory
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

// function to make a file in the current working directory
export const touchHandler: CommandHandler = (args, state) => {
  if (!args[0]) {
    return "touch: missing file name";
  }
  const fileName = args[0];
  const currNode = state.cwd;
  if (currNode.type !== "directory") {
    return "Current node is not a directory";
  }
  if (!currNode.children) {
    currNode.children = [];
  }
  if (currNode.children.some((child) => child.name === fileName)) {
    return `File "${fileName}" already exists`;
  }
  const newFile: FileNode = {
    id: `${currNode.id}-${Date.now()}`,
    name: fileName,
    type: "file",
    parent: currNode,
    content: "",
  }
  currNode.children.push(newFile);

  return `File "${fileName}" created`;

}

// Function to write content to a file in the current working directory


// THE CMD SHOULD LOOK LIKE THIS : echo filename.txt "wASSUP MF " 

export const echoHandler: CommandHandler = (args, state) => {
  if (args.length < 2) {
    return "echo: missing file name or content";
  }
  const fileName = args[0];
  const content = args.slice(1).join(" ");
  const currNode = state.cwd;
  if (currNode.type !== "directory" || !currNode.children) {
    return "Current node is not a directory";
  }
  const targetFile = currNode.children.find(
    (child) => child.name === fileName && child.type === "file",
  );
  if (!targetFile) {
    return `echo: no such file: ${fileName}`;
  }
  targetFile.content = content;
  return `Content written to "${fileName}"`;
}


// Command to see what is written in a file : cat filename.txt
export const catHandler: CommandHandler = (args, state) => {
  if (!args[0]) {
    return "cat: missing file name";
  }
  const fileName = args[0];
  const currNode = state.cwd;
  if (currNode.type !== "directory" || !currNode.children) {
    return "Current node is not a directory";
  }
  const targetFile = currNode.children.find(
    (child) => child.name === fileName && child.type === "file",
  );
  if (!targetFile) {
    return `cat: no such file: ${fileName}`;
  }
  return targetFile.content;
}

// Command registry mapping command names to their handlers
export const commandRegistry: Record<string, CommandHandler> = {
  ls: lsHandler,
  mkdir: mkdirHandler,
  cd: cdHandler,
  touch: touchHandler,
  echo: echoHandler,
  cat: catHandler,
};


// Function to get the command handler based on the command name 
export const getCommand = (commandName: string): CommandHandler | null => {
  return commandRegistry[commandName] || null;
};
