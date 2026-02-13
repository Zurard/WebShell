// we need a a tree like structure for micmicking a file system and we need to store the current working directory and the command history

interface FileNode {
 id: string;  // unique identifier for the node
 name : string;  // name of the file or directory
 type: "file" | "directory";  // to differentiate between files and directories
 parent: string | null;  // parent node id, null for root
 children?: FileNode[]; // only for directories
 content?: string; // only for files
}

interface ShellState {
    cwd: string;  // tells me about the current working directory
    env: Record<string, string>; // tell me about the environment variables
    history: string[];  // command history
    root: FileNode;    // the root of the file system tree
}


const RootNode: FileNode = {
    id: "root",
    name: "/",
    type: "directory",
    parent: null,
    children: []
}

export const initialShellState: ShellState = {
    cwd : "/WebShell",
    env:{},
    history: [],
    root: RootNode
}


const findNodeByPath = (node: FileNode, path: string)  => {
    const dir = path.split("/").filter(Boolean);
    console.log ("Finding node by path:", dir);
    let currentNode = node;
    for (const part of dir){
        if (currentNode.type !== "directory" || !currentNode.children) {
            return null;
        }
        const nextNode = currentNode.children.find(child => child.name === part);
        if (!nextNode) {
            return null;
        }
        currentNode = nextNode;
    }
    return currentNode;
}


export const addDirectory = (state: ShellState, cwd: string) => {
    // we need to add a directory to the file system tree
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "directory"){
        const newDir: FileNode = {
            id: `${currNode.id}-${currNode.children ? currNode.children.length : 0}`,
            name: `dir${currNode.children ? currNode.children.length : 0}`,
            type: "directory",
            parent: currNode.id,
            children: []
        }
        if (!currNode.children) {
            currNode.children = [];
        }
        currNode.children.push(newDir);
    }
}


export const addFile = (state: ShellState, cwd: string, content: string) => {
    // we need to add a file in the file system tree
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "directory"){
        const newFile: FileNode = {
            id: `${currNode.id}-${currNode.children ? currNode.children.length : 0}`,
            name: `file${currNode.children ? currNode.children.length : 0}`,
            type: "file",
            parent: currNode.id,
            content
        }
        if (!currNode.children) {
            currNode.children = [];
        }
        currNode.children.push(newFile);
    }
}


export const readFile = (state: ShellState, cwd: string) => {
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "file"){
        return currNode.content || "";
    }
    return null;
}

export const writeFile = (state: ShellState, cwd: string, content: string) => {
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "file"){
        currNode.content = content;
    }
}

export const listDirectory = (state: ShellState, cwd: string) => {
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "directory" && currNode.children) {
        return currNode.children.map(child => child.name);
    }
    return null;
}

export const changeDirectory = (state: ShellState, cwd: string) => {
    const currNode = findNodeByPath(state.root, cwd);
    if (currNode && currNode.type === "directory"){
        state.cwd = cwd;
    }
}
export const getCurrentWorkingDirectory = (state: ShellState) => {  
    return state.cwd;
}

