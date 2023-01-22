import { CommandType, Parser } from "@src/parser";
import { Readable } from "stream";

describe("Parser Class", () => {
  describe("Parser.build", () => {
    test("should be able to build parser", () => {
      const stream = Readable.from(["command1\n", "command2\n"]);
      expect(() => {
        Parser.build(stream);
      }).not.toThrowError();
    });
  });

  describe("Parser#hasMoreCommands", () => {
    test("should return true if have the next", async () => {
      const stream = Readable.from(["command1\n"]);
      const parser = await Parser.build(stream);
      expect(parser.hasMoreCommands()).toEqual(true);
    });

    test("should return false if done have the next", async () => {
      const stream = Readable.from([]);

      const parser = await Parser.build(stream);
      expect(parser.hasMoreCommands()).toEqual(false);
    });
  });

  describe("Parser#advance", () => {
    test("should load the next command if exists", async () => {
      const stream = Readable.from([
        "//COMMENT\n",
        "command1 // COMMENT \n",
        "//COMMENT\n",
        "  command2\n",
      ]);

      const parser = await Parser.build(stream);
      expect(parser.statement).toEqual("");
      await parser.advance();
      expect(parser.statement).toEqual("command1");
      await parser.advance();
      expect(parser.statement).toEqual("command2");
      await parser.advance();
      expect(parser.statement).toEqual("command2");
    });
  });

  describe("Parser#commandType", () => {
    test("should return correct command type", async () => {
      const stream = Readable.from([
        "  push constant 0\n",
        "  pop local 0\n",
        "  push argument 1\n",
        "  pop local 1\n",
        "  push constant 0\n",
        "  push local 0\n",
        "  Eq\n",
      ]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_PUSH); // push constant 0
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_POP); // pop local 0
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_PUSH); // push argument 1
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_POP); // pop local 1
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_PUSH); // push constant 0
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_PUSH); // push local 0
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_ARITHMETIC); // Eq
    });
  });

  describe("Parser#arg1", () => {
    test("should return correct command type", async () => {
      const stream = Readable.from([
        "  push constant 0\n",
        "  pop local 0\n",
        "  Eq\n",
      ]);

      const parser = await Parser.build(stream);
      await parser.advance();

      expect(parser.command()).toEqual("push")
      expect(parser.arg1()).toEqual("constant")
      expect(parser.arg2()).toEqual(0)

      await parser.advance();
      expect(parser.command()).toEqual("pop")
      expect(parser.arg1()).toEqual("local")
      expect(parser.arg2()).toEqual(0)

      await parser.advance();
      expect(parser.command()).toEqual("eq")
  })})
})
