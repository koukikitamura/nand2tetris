// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
//
// This program only needs to handle arguments that satisfy
// R0 >= 0, R1 >= 0, and R0*R1 < 32768.

// Put your code here.

// R0とR1回足す
// R2に値を入れる

// num1: R0
// num2: R1
// result: R2
// i: R3

  // initialize result & i
  @R2
  M=0
  @R3
  M=1

(LOOP)
  // jump to end if i - num2 > 0
  @R3
  D=M // +i
  @R1
  D=D-M // -num2
  @END
  D;JGT

  // add num1 to result
  @R0 // load num1
  D=M
  @R2 // load result
  M=M+D

  // increment i
  @R3
  M=M+1

  // jump back to loop top
  @LOOP
  0;JMP

(END)
  @END
  0;JMP
