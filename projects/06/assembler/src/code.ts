const destBinaryMap: { [key: string]: string } = {
  null: "000",
  M: "001",
  D: "010",
  MD: "011",
  A: "100",
  AM: "101",
  AD: "110",
  AMD: "111",
};

export const dest = (assembly: string): string => {
  return destBinaryMap[assembly] || "000";
};

const compBinaryA0Map: { [key: string]: string } = {
  "0": "101010",
  "1": "111111",
  "-1": "111010",
  D: "001100",
  A: "110000",
  "!D": "001101",
  "!A": "110001",
  "-D": "001111",
  "-A": "110011",
  "D+1": "011111",
  "A+1": "110111",
  "D-1": "001110",
  "A-1": "110010",
  "D+A": "000010",
  "D-A": "010011",
  "A-D": "000111",
  "D&A": "000000",
  "D|A": "010101",
};

const compBinaryA1Map: { [key: string]: string } = {
  M: "110000",
  "!M": "110001",
  "-M": "110011",
  "M+1": "110111",
  "M-1": "110010",
  "D+M": "000010",
  "D-M": "010011",
  "M-D": "000111",
  "D&M": "000000",
  "D|M": "010101",
};

export const comp = (assembly: string): string => {
  const a0 = compBinaryA0Map[assembly];
  if (a0) {
    return "0" + a0;
  }

  const a1 = compBinaryA1Map[assembly];
  if (a1) {
    return "1" + a1;
  }

  throw new Error(`unknown comp assembly: ${assembly}`);
};

const jmpBinaryMap: { [key: string]: string } = {
  null: "000",
  JGT: "001",
  JEQ: "010",
  JGE: "011",
  JLT: "100",
  JNE: "101",
  JLE: "110",
  JMP: "111",
};

export const jump = (assembly: string): string => {
  return jmpBinaryMap[assembly] || "000";
};
