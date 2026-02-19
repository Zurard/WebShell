// need to parse the command in its individual components and then execute it based on the command type and arguments

export const parseCommand = (command: string) => {
  // i need to convert the command string into a json object with the command type and its arguments
  const [cmd, ...args] = command.trim().split(/\s+/);

  if (!cmd) {
    // console.log("No command entered");
    return { parsedCommand: null };
  }
  const parsedCommand = {
    cmd,
    args,
  };
  // console.log("Parsed Command:", parsedCommand);
  return {
    parsedCommand,
  };
};
