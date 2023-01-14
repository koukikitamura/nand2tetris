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
        "command2\n",
      ]);

      const parser = await Parser.build(stream);
      expect(parser.command).toEqual("");
      await parser.advance();
      expect(parser.command).toEqual("command1");
      await parser.advance();
      expect(parser.command).toEqual("command2");
      await parser.advance();
      expect(parser.command).toEqual("");
    });
  });

  describe("Parser#commandType", () => {
    test("should return correct command type", async () => {
      const stream = Readable.from([
        "  @i\n",
        "  M=1\n",
        "  @sum\n",
        "  M=0\n",
        "(LOOP)\n",
        "  @i\n",
      ]);

      const parser = await Parser.build(stream);
      expect(parser.commandType()).toEqual(CommandType.UNKNOWN);
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.A_COMMAND); // @i
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_COMMAND); // M=1
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.A_COMMAND); // @sum
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.C_COMMAND); // M=0
      await parser.advance();
      expect(parser.commandType()).toEqual(CommandType.L_COMMAND); // (LOOP)
    });
  });

  describe("Parser#symbol", () => {
    test("should return symbol", async () => {
      const stream = Readable.from(["@i\n", "@100\n", "(LOOP)\n"]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(parser.symbol()).toEqual("i"); // @i
      await parser.advance();
      expect(parser.symbol()).toEqual("100"); // @100
      await parser.advance();
      expect(parser.symbol()).toEqual("LOOP"); // (LOOP)
    });

    test("should throw error when command is C command", async () => {
      const stream = Readable.from(["M=D+1"]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(() => {
        parser.symbol();
      }).toThrow(Error);
    });
  });

  describe("Parser#dest", () => {
    test("should return dest part", async () => {
      const stream = Readable.from(["M=D+1\n", "MD=D+1\n", "D;JGT\n"]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(parser.dest()).toEqual("M"); // @M=D+1
      await parser.advance();
      expect(parser.dest()).toEqual("MD"); // @MD=D+1
      await parser.advance();
      expect(parser.dest()).toEqual(""); // D;JGT
    });

    test("should throw error when command is not C command", async () => {
      const stream = Readable.from(["@1"]);
      const parser = await Parser.build(stream);
      await parser.advance();
      expect(() => {
        parser.dest();
      }).toThrow(Error);
    });
  });

  describe("Parser#comp", () => {
    test("should return comp part", async () => {
      const stream = Readable.from(["M=D+1\n", "0;JMP\n"]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(parser.comp()).toEqual("D+1"); // M=D+1
      await parser.advance();
      expect(parser.comp()).toEqual("0"); // 0;JMP
    });

    test("should throw error when command is not C command", async () => {
      const stream = Readable.from(["@1"]);
      const parser = await Parser.build(stream);
      await parser.advance();
      expect(() => {
        parser.comp();
      }).toThrow(Error);
    });
  });

  describe("Parser#jump", () => {
    test("should return jump part", async () => {
      const stream = Readable.from(["M=D+1\n", "0;JMP\n"]);

      const parser = await Parser.build(stream);
      await parser.advance();
      expect(parser.jump()).toEqual(""); // M=D+1
      await parser.advance();
      expect(parser.jump()).toEqual("JMP"); // 0;JMP
    });

    test("should throw error when command is not C command", async () => {
      const stream = Readable.from(["@1"]);
      const parser = await Parser.build(stream);
      await parser.advance();
      expect(() => {
        parser.jump();
      }).toThrow(Error);
    });
  });
});
