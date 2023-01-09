import * as readline from "readline";

export class Parser {
  public command: string;
  private lineIterator: AsyncIterableIterator<string>;
  private nextLine: IteratorResult<string, string>;

  constructor(stream: NodeJS.ReadableStream) {
    const readLine = readline.createInterface({
      input: stream,
    });
    this.lineIterator = readLine[Symbol.asyncIterator]();
  }

  hasMoreCommands(): boolean {
    return !this.nextLine.done;
  }

  async advance(): Promise<void> {
    while (this.getNextCommand() === "" && this.hasMoreCommands()) {
      this.nextLine = await this.lineIterator.next();
    }
    this.command = this.getNextCommand();
    this.nextLine = await this.lineIterator.next();
  }

  commandType(): CommandType {
    if (this.command.length === 0) {
      return CommandType.UNKNOWN;
    }

    if (this.command[0] === "@") {
      return CommandType.A_COMMAND;
    }
    if (this.command[0] === "(") {
      return CommandType.L_COMMAND;
    }
    return CommandType.C_COMMAND;
  }

  symbol(): string {
    if (this.commandType() === CommandType.A_COMMAND) {
      return this.command.slice(1);
    }
    if (this.commandType() === CommandType.L_COMMAND) {
      return this.command.slice(1, -1);
    }

    throw new Error("symbol function is called only by A_COMMAND or L_COMMAND");
  }

  dist(): string {
    if (this.commandType() !== CommandType.C_COMMAND) {
      throw new Error("dist function is called only by C_COMMAND");
    }

    const equalIndex = this.command.indexOf("=");
    if (equalIndex === -1) {
      return "";
    }
    return this.command.slice(0, equalIndex);
  }

  comp(): string {
    if (this.commandType() !== CommandType.C_COMMAND) {
      throw new Error("dist function is called only by C_COMMAND");
    }

    const equalIndex = this.command.indexOf("=");
    const colonIndex = this.command.indexOf(";");
    let compHead = 0;
    if (equalIndex !== -1) {
      compHead = equalIndex + 1;
    }

    if (colonIndex === -1) {
      return this.command.slice(compHead);
    } else {
      return this.command.slice(compHead, colonIndex);
    }
  }

  jump(): string {
    if (this.commandType() !== CommandType.C_COMMAND) {
      throw new Error("dist function is called only by C_COMMAND");
    }

    const colonIndex = this.command.indexOf(";");
    if (colonIndex === -1) {
      return "";
    }
    return this.command.slice(colonIndex + 1);
  }

  private getNextCommand(): string {
    let command = this.nextLine.value;
    if (!command) {
      return "";
    }
    command = this.trimComment(command);
    command = command.trim();
    return command;
  }

  private trimComment(line: string): string {
    for (let i = 0; i + 1 < line.length; i++) {
      if (line[i] == "/" && line[i + 1] == "/") {
        return line.slice(0, i);
      }
    }

    return line;
  }

  static async build(stream: NodeJS.ReadableStream): Promise<Parser> {
    const parser = new Parser(stream);
    parser.command = "";
    parser.nextLine = await parser.lineIterator.next();
    return parser;
  }
}

export enum CommandType {
  A_COMMAND = "A_COMMAND",
  C_COMMAND = "C_COMMAND",
  L_COMMAND = "L_COMMAND",
  UNKNOWN = "UNKNOWN",
}
