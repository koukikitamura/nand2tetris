import { dest, comp, jump } from "@src/code";

describe("Code Module", () => {
  describe("dest()", () => {
    test("should convert assembly to binary", () => {
      expect(dest("M")).toEqual("001");
      expect(dest("MD")).toEqual("011");
      expect(dest("AMD")).toEqual("111");

      expect(dest("XXX")).toEqual("000");
    });
  });

  describe("comp()", () => {
    test("should convert assembly to binary", () => {
      expect(comp("0")).toEqual("0101010");
      expect(comp("1")).toEqual("0111111");
      expect(comp("D")).toEqual("0001100");
      expect(comp("A")).toEqual("0110000");
      expect(comp("D&A")).toEqual("0000000");
      expect(comp("D|M")).toEqual("1010101");
    });

    test("should throw error when get the unknown", () => {
      expect(() => {
        comp("XXX");
      }).toThrow(Error);
    });
  });

  describe("jump()", () => {
    test("should convert assembly to binary", () => {
      expect(jump("JGT")).toEqual("001");
      expect(jump("JGE")).toEqual("011");
      expect(jump("JMP")).toEqual("111");

      expect(jump("XXX")).toEqual("000");
    });
  });
});
