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


