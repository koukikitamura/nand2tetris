import * as fs from "fs";
import * as path from "path";
import { CommandType, Parser } from "./parser";
import { dest, comp, jump } from "./code";
import * as log4js from "log4js";

const logger = log4js.getLogger();
logger.level = "debug";

const assemble = async () => {
  const filepath = process.argv[2]; // first argument
  const pathParsed = path.parse(filepath);
  const binaryFilePath =
    path.join(pathParsed.root, pathParsed.dir, pathParsed.name) + ".hack";

  console.log(binaryFilePath);
  logger.info(`start to assemble: ${path}`);

  const assemblyStream = fs.createReadStream(filepath, "utf8");
  const binaryStream = fs.createWriteStream(binaryFilePath, "utf8");
  const parser = await Parser.build(assemblyStream);

  while (parser.hasMoreCommands()) {
    await parser.advance();
    logger.debug(`[DEBUG] assembling: ${parser.command}`);

    let binaryCommand = "";
    switch (parser.commandType()) {
      case CommandType.A_COMMAND:
        binaryCommand = assembleACommand(parser);
        break;
      case CommandType.C_COMMAND:
        binaryCommand = assembleCCommand(parser);
        break;
    }

    binaryStream.write(binaryCommand + "\n");
  }
  logger.info("finish the assemble");
};

interface IParser {
  symbol(): string;
  dest(): string;
  comp(): string;
  jump(): string;
}

const assembleACommand = (parser: IParser): string => {
  const addressDecimal = parseInt(parser.symbol());
  const addressBinary = addressDecimal.toString(2);

  return "0" + addressBinary.padStart(15, "0");
};

const assembleCCommand = (parser: IParser): string => {
  const compPart = comp(parser.comp());
  const destPart = dest(parser.dest());
  const jumpPart = jump(parser.jump());

  return "111" + compPart + destPart + jumpPart;
};

assemble();
