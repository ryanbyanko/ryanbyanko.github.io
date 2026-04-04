# TI Assembly Size Optimization

Problem Introduction
--------------------

This post was originally going to be at the end of my [TI Assembly Tutorial](https://www.youtube.com/watch?v=qAR3qtmN-3k) video. If writing an interesting program in raw machine code wasn't enough for you, let's make things a little more interesting by optimizing it. Specifically, we're going to try to make it as short as possible.

By the way, this process of finding the shortest program to accomplish a task is known as code golfing, and I highly recommend checking out the [Code Golf Stack Exchange](https://codegolf.stackexchange.com/). In our case, golfing is also space optimization. The less bytes we use, the less memory our program takes up in memory.

If you haven't seen my YouTube videos, the program we're going to be working on is a quine, which prints the bytes that make up the program itself. The first working version I wrote was too long to fit on screen. You could not see all of the program's code. It was not a quine to me.

It wasn't too hard to get it short enough to fit on screen, but I continued golfing it down just for fun. The version I showcased in my videos is already heavily optimized at just 34 bytes, but while making the videos I managed to further optimize it down to just 32 bytes.

Basic Optimizations
-------------------

The best optimizations usually involve switching up a program's control flow. The quine program required two slightly different print calls for each byte, since each byte is represented by two hex characters. The first print converts the upper four bits to an ASCII value, and the second print the lower four bits. But most of the code is spent converting each four bit nybble to an ASCII value, which both calls share. Creating a loop for this conversion and printing logic instead saved nine whole bytes, even with the overhead of setting up the loop.

Golfing is all about thinking outside of the box and using techniques that make your code as short as possible, even if it's awkward or likely to run slower.

In my earlier code there is this awkward `0F0F0F0F`, which shifts the A register to the right four times (for shifting the upper four bits to the same place as the lower four before converting to ASCII). Looking at the Z80's instruction set, this seemed to be the most efficient way to do four bit shifts. But while I was randomly scrolling the TI OS system calls, I stumbled across the `ShRAcc` function which "Shifts the upper four bits of the accumulator to the lower four bits". It takes four bit shifts to `0F0F0F0F`, but only three bytes to call `ShRAcc`!

In the online reference for `ShRAcc`, the author actually calls this function a "pretty inefficient way to do this". They must not have been thinking about space efficiency.

The first optimization I came up while making this video involves the `DJNZ` instruction, or Decrement and Jump if Non Zero. In just two bytes of space, you can decrement \*and\* do a conditional jump, which normally takes three bytes. This instruction can only use the `B` register as a loop counter, so I had to shuffle some registers around. `B` is the loop counter, and `C` now holds the byte from `HL` that we want to print. Instead of setting `C` to `255`, incrementing and conditionally jumping in three bytes, we can set `B` to `2`, and `DJNZ` in only two bytes.

The next optimization uses an even weirder instruction: the Decimal Adjust after Addition instruction.

The Dazzling DAA Optimization
-----------------------------

First, we need to talk about BCD. Binary Coded Decimal is where decimal digits are represented using binary. It takes four binary digits to represent the ten different digits 0-9, so an 8-bit register can fit two decimal digits using BCD. Adding these "packed" BCD numbers can result in invalid states.

For example:

[![](https://blogger.googleusercontent.com/img/a/AVvXsEjHzDBZ69wMufYY9AqRWfcr7SaGyb3fkQ781UumIPY7dB2e7lHAkMlYRDYvcv0nGyUnYRGcf8Vbzr5r5lwc7vidoN8OESnSLdLJGtOAOaMbeYp-1tCX6ZqNCM3E8fqRQVdEREJZsvNBapXqOLkUVz8smGELZblASuVkegE18Cokwk5KpsS6j9ivnFdqY6D8)](https://blogger.googleusercontent.com/img/a/AVvXsEjHzDBZ69wMufYY9AqRWfcr7SaGyb3fkQ781UumIPY7dB2e7lHAkMlYRDYvcv0nGyUnYRGcf8Vbzr5r5lwc7vidoN8OESnSLdLJGtOAOaMbeYp-1tCX6ZqNCM3E8fqRQVdEREJZsvNBapXqOLkUVz8smGELZblASuVkegE18Cokwk5KpsS6j9ivnFdqY6D8)

  
  
  
In this case, the binary value `1111` (or 15) isn't any decimal digit from 0-9. The Decimal Adjust after Addition command takes care of this:

[![](https://blogger.googleusercontent.com/img/a/AVvXsEhNcGaTt899Er-qqhZbZyk3j0ZbLHpVVluYHvQaL5lqc65EiQ6KerM5vD5HHalErYXBfnnH8-GfJ0stMb4PgzlmOXe3a377UStjw7-AnT-AmeqNdkWsz-YEGPreA0jd0vxQH57xWRPsRH3xEfe6GVYXg0aJabYfl9CBSVGN8QwJOkEgW6_N0x3OstOkxQzp)](https://blogger.googleusercontent.com/img/a/AVvXsEhNcGaTt899Er-qqhZbZyk3j0ZbLHpVVluYHvQaL5lqc65EiQ6KerM5vD5HHalErYXBfnnH8-GfJ0stMb4PgzlmOXe3a377UStjw7-AnT-AmeqNdkWsz-YEGPreA0jd0vxQH57xWRPsRH3xEfe6GVYXg0aJabYfl9CBSVGN8QwJOkEgW6_N0x3OstOkxQzp)

  
The DAA fixes invalid states by subtracting ten and adding one to the next decimal digit. This process turns out to be very relevant to the process of converting number values to ASCII codes. Let me explain.

Once a single four bit value has been isolated, it can't be immediately printed. The ASCII code at `9` doesn't correspond to the character "9", it actually corresponds to a bell character which would make an audible bell sound on radio telegraph machines and the like. The number digits start at 48, so adding 48 to the value will map the digit values to their correct ASCII characters "0", "1", "2", and so on.

Unfortunately, the characters after "9" are ":", ";", "<", "=", and other punctation characters because of mechanical typewriters or something. To map values greater than 9 to corresponding alphabet characters, the CPU must conditionally add another 7 to all values greater than 57.

My original code compares the value to 57, jumps if it's smaller, or otherwise adds another 7. This takes six bytes in total.

The `DAA` instruction does something very clever. Adding 48 leaves the lower four bits untouched, since 48 is `11 0000` in binary. After this addition, if the lower four bits are in the range 0-9, they are valid decimal and remain untouched. But if the value is greater than 9 (corresponding to a binary value greater than 57, ie the values that need to shift), then a decimal adjust is needed. The decimal adjust subtracts 10, and adds 1 to the upper four bits, which adds 16 to the decimal value. Subtracting 10 and adding 16 means adding an additional 6 to the necessary values!

Oh, wait. We need to add 7. Unfortunately, this trick does not cut out five whole bytes. But! Now we can compare to 57 like before. If the value is below 57 and doesn't need to be adjusted, the carry flag will be set (1). Otherwise, the carry flag is 0. Now, the SuBtract with Carry instruction is used to subtract -1 (255) and the carry. If the carry flag is set, this means adding 1 and subtracting 1 which doesn't change the value. If the carry flag is reset, this adds 1 and finally shifts the higher values to their correct, alphabetical positions in ASCII. In total, the `DAA`, compare to 57, and subtract 255 with carry takes five bytes.

Hours of work, one byte saved. Here is the final, 32 byte version of my quine, and great repesct for anyone who can do it in less:

`21 95 9D 4E 06 02 79 EF D4 41 E6 0F C6 30 27 FE 3A DE FF EF 04 45 79 10 F1 23 AF B9 20 E4 C9 00`