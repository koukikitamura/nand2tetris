// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed.
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.
(LOOP_KEY)
  // select color based on which push key or not
  @KBD
  D=M
  @IF_PRESSED
  D;JNE
  (IF_NOT_PRESSED)
    @color
    M=0
    @IF_END
    0;JMP
  (IF_PRESSED)
    @color
    M=-1 // "-1" in binary is "1111 1111 1111 1111"
  (IF_END)

  // the number of pixel is 512 x 256
  // the number of word is 8192(256 x 32)
  // the word consit of 16bit
  @8192
  D=A
  @ram_num
  M=D
  @count
  M=0
  @SCREEN
  D=A
  @position
  M=D

  (LOOP_FILL)
    @ram_num
    D=M
    @count
    D=D-M
    @LOOP_FILL_END
    D;JEQ // jump end if ram_num - count == 0

    @color
    D=M
    @position
    A=M
    M=D

    @count
    M=M+1
    @position
    M=M+1
    @LOOP_FILL
    0;JMP
  (LOOP_FILL_END)
  @LOOP_KEY
  0;JMP
(LOOP_KEY_END)
