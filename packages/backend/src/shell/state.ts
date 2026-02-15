// we need a tree like structure for mimicking a file system and we need to store the current working directory and the command history

interface FileNode {
  id: string; // unique identifier for the node
  name: string; // name of the file or directory
  type: "file" | "directory"; // to differentiate between files and directories
  parent: FileNode | null; // parent node reference, null for root
  children?: FileNode[]; // only for directories
  content?: string; // only for files
}

interface ShellState {
  cwd: FileNode; // tells me about the current working directory
  env: Record<string, string>; // tell me about the environment variables
  history: string[]; // command history
  root: FileNode; // the root of the file system tree
}

const RootNode: FileNode = {
  id: "root",
  name: "/",
  type: "directory",
  parent: null,
  children: [],
};

export const initialShellState: ShellState = {
  cwd: RootNode,
  env: {},
  history: [],
  root: RootNode,
};

export const resolvePath = (
  state: ShellState,
  path: string,
): FileNode | null => {
  let currentNode = path.startsWith("/") ? state.root : state.cwd;
  const parts = path.split("/").filter(Boolean);
  for (const part of parts) {
    if (part === ".") {
      continue; // Stay where you are
    }
    if (part === "..") {
      if (currentNode.parent) {
        currentNode = currentNode.parent;
      }
      continue;
    }

    if (currentNode.type !== "directory" || !currentNode.children) {
      return null; // Can't traverse into non-directory
    }
    const nextNode = currentNode.children.find((child) => child.name === part);
    if (!nextNode) {
      return null; // Path doesn't exist
    }

    currentNode = nextNode;
  }
  return currentNode;
};


export const addDirectory = (
  state: ShellState,
  dirName: string,
): string | void => {
  const currNode = state.cwd;

  if (currNode.type !== "directory") {
    return "Current node is not a directory";
  }

  // Check if directory already exists
  if (
    currNode.children &&
    currNode.children.some(
      (child) => child.name === dirName && child.type === "directory",
    )
  ) {
    return `Directory '${dirName}' already exists`;
  }

  // Create new directory
  const newDir: FileNode = {
    id: `${currNode.id}-${Date.now()}`,
    name: dirName,
    type: "directory",
    parent: currNode,
    children: [],
  };

  if (!currNode.children) {
    currNode.children = [];
  }

  currNode.children.push(newDir);
};

export const addFile = (
  state: ShellState,
  fileName: string,
  content: string = "",
): string | void => {
  // Add file to current working directory
  const currNode = state.cwd;

  if (currNode.type !== "directory") {
    return "Current node is not a directory";
  }

  // Check if file already exists
  if (
    currNode.children &&
    currNode.children.some(
      (child) => child.name === fileName && child.type === "file",
    )
  ) {
    return `File '${fileName}' already exists`;
  }

  // Create new file
  const newFile: FileNode = {
    id: `${currNode.id}-${Date.now()}`,
    name: fileName,
    type: "file",
    parent: currNode,
    content,
  };

  if (!currNode.children) {
    currNode.children = [];
  }

  currNode.children.push(newFile);
};

export const readFile = (state: ShellState, path: string): string | null => {
  // Resolve path and read file
  const target = resolvePath(state, path);

  if (!target) {
    return null; // Path doesn't exist
  }

  if (target.type !== "file") {
    return null; // Not a file
  }

  return target.content || "";
};

export const writeFile = (
  state: ShellState,
  path: string,
  content: string,
): string | void => {
  // Resolve path and write to file
  const target = resolvePath(state, path);

  if (!target) {
    return "File not found";
  }

  if (target.type !== "file") {
    return "Not a file";
  }

  target.content = content;
};

export const listDirectory = (
  state: ShellState,
  path: string = ".",
): string[] | null => {
  // List contents of directory
  const target = resolvePath(state, path);

  if (!target) {
    return null; // Path doesn't exist
  }

  if (target.type !== "directory") {
    return null; // Not a directory
  }

  if (!target.children) {
    return [];
  }

  return target.children.map((child) => child.name);
};

export const changeDirectory = (
  state: ShellState,
  path: string,
): string | void => {
  // Change current working directory
  const target = resolvePath(state, path);

  if (!target) {
    return "Directory not found";
  }

  if (target.type !== "directory") {
    return "Not a directory";
  }

  state.cwd = target;
};

export const getCurrentWorkingDirectory = (state: ShellState): string => {
  // Get full path of current directory
  let path = "";
  let node: FileNode | null = state.cwd;

  while (node) {
    if (node.name !== "/") {
      path = "/" + node.name + path;
    }
    node = node.parent;
  }

  return path || "/";
};
