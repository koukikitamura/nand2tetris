import * as readline from "readline";

export class Parser {
  public statement: string;
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
    if (!this.hasMoreCommands()) {
      return
    }
    while (this.getNextStatement() === "" && this.hasMoreCommands()) {
      this.nextLine = await this.lineIterator.next();
    }
    this.statement = this.getNextStatement();
    this.nextLine = await this.lineIterator.next();
  }

  commandType(): CommandType {
    if (COMMAND_ARITHMETIC.has(this.command())) {
      return CommandType.C_ARITHMETIC
    } else if (this.command() === COMMAND_PUSH) {
      return CommandType.C_PUSH
    } else if (this.command() === COMMAND_POP) {
      return CommandType.C_POP
    }

    throw new Error(`unknown command type, statement is ${this.statement}`)
  }

  arg1(): string {
    const arg1 = this.splitStatement()[1]

    if (!arg1) {
      throw new Error(`arg1 is not exist, statement is ${this.statement}`)
    }

    return arg1
  }

  arg2(): number {
    const arg2Str= this.splitStatement()[2]
    if (!arg2Str) {
      throw new Error(`arg2 is not exist, statement is ${this.statement}`)
    }

    const arg2 = parseInt(arg2Str)

    if (isNaN(arg2)) {
      throw new Error(`arg2 is not a number, statement is ${this.statement}`)
    }

    return arg2
  }

  command(): string {
    const command = this.splitStatement()[0]
    if (!command) {
      throw new Error(`command is not exist, statement is ${this.statement}`)
    }
    return command.toLowerCase()
  }

  private splitStatement(): string[] {
    return this.statement.split(/\s+/)
  }

  private getNextStatement(): string {
    let statement = this.nextLine.value;
    if (!statement) {
      return "";
    }
    statement = this.trimComment(statement);
    return statement.trim();
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
    parser.statement = "";
    parser.nextLine = await parser.lineIterator.next();
    return parser;
  }
}

const COMMAND_ARITHMETIC = new Set([
  "add",
  "sub",
  "neg",
  "eq",
  "gt",
  "lt",
  "and",
  "or",
  "not"
])
const COMMAND_PUSH = "push"
const COMMAND_POP = "pop"

export enum CommandType {
  C_ARITHMETIC = "C_ARITHMETIC",
  C_PUSH = "C_PUSH",
  C_POP = "C_POP",
  C_LABEL = "C_LABEL",
  C_GOTO = "C_LABEL",
  C_IF = "C_IF",
  C_FUNCTION = "C_FUNCTION",
  C_CALL = "C_CALL",
  UNKNOWN = "UNKNOWN"
}
