import * as fs from "fs";
import * as path from "path";
import { CommandType, Parser } from "./parser";
import { dest, comp, jump } from "./code";
import * as log4js from "log4js";
import { SymbolTable, FREE_ADDRESS_HEAD } from "./symbol-table";

const logger = log4js.getLogger();
logger.level = "trace";

class Assembler {
  private sourcePath: string;
  private symbolTable: SymbolTable;
  private variablePointer: number;

  constructor(sourcePath: string) {
    this.sourcePath = sourcePath;
    this.symbolTable = new SymbolTable();
    this.variablePointer = FREE_ADDRESS_HEAD;
  }

  async assemble(): Promise<void> {
    logger.info(`start to assemble: the source is ${this.sourcePath}`);
    await this.resolveLCommand();
    logger.debug(
      `after resolve L Commands, the symbol table is ${this.symbolTable.dump()}`
    );
    await this.assembleSkippingLCommand();
    logger.debug(
      `after assemble, the symbol table is ${this.symbolTable.dump()}`
    );
    logger.info(`finish assembling: the destination is ${this.destPath()}`);
  }

  private async resolveLCommand() {
    const assemblyStream = fs.createReadStream(this.sourcePath, "utf8");
    const parser = await Parser.build(assemblyStream);

    let lineNum = 0;
    while (parser.hasMoreCommands()) {
      await parser.advance();
      switch (parser.commandType()) {
        case CommandType.A_COMMAND:
          lineNum++;
          break;
        case CommandType.C_COMMAND:
          lineNum++;
          break;
        case CommandType.L_COMMAND:
          this.symbolTable.addEntry(parser.symbol(), lineNum);
          break;
      }
    }
  }

  async assembleSkippingLCommand(): Promise<void> {
    const assemblyStream = fs.createReadStream(this.sourcePath, "utf8");
    const binaryStream = fs.createWriteStream(this.destPath(), "utf8");
    const parser = await Parser.build(assemblyStream);

    while (parser.hasMoreCommands()) {
      await parser.advance();
      logger.debug(`assembling: ${parser.command}`);

      let binaryCommand = "";
      switch (parser.commandType()) {
        case CommandType.A_COMMAND:
          binaryCommand = this.assembleACommand(parser);
          break;
        case CommandType.C_COMMAND:
          binaryCommand = this.assembleCCommand(parser);
          break;
        case CommandType.L_COMMAND:
          continue;
      }

      binaryStream.write(binaryCommand + "\n");
    }
  }

  private assembleACommand(parser: Parser): string {
    let address = parseInt(parser.symbol());

    if (isNaN(address)) {
      const valName = parser.symbol();

      if (this.symbolTable.contains(valName)) {
        address = this.symbolTable.getAddress(valName);
      } else {
        this.symbolTable.addEntry(valName, this.variablePointer);
        address = this.variablePointer;
        this.variablePointer++;
      }
    }

    const addressBinary = address.toString(2);
    return "0" + addressBinary.padStart(15, "0");
  }

  private assembleCCommand(parser: Parser): string {
    const compPart = comp(parser.comp());
    const destPart = dest(parser.dest());
    const jumpPart = jump(parser.jump());

    return "111" + compPart + destPart + jumpPart;
  }

  private destPath(): string {
    const sourcePath = path.parse(this.sourcePath);
    return (
      path.join(sourcePath.root, sourcePath.dir, sourcePath.name) + ".hack"
    );
  }
}

const run = async () => {
  const filepath = process.argv[2]; // first argument
  const assembler = new Assembler(filepath);
  await assembler.assemble();
};

run();
