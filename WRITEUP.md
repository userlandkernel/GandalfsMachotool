# Writing a MachO Analysis Tool and Disassembler in javascript
Mach-O is a fileformat commonly used in Apple's Operating Systems such as iOS and macOS.  
The fileformat consists of a header and loadcommands that serve as hint for the structure of the binary made up from segments with sections.  
One segment for example is the symbol table which contains references of all unstripped symbols with their code locations and string locations.  
[Learn more about mach-o](https://github.com/aidansteele/osx-abi-macho-file-format-reference).  

## The flow of a mach-o analysis tool
1. Load binary data.  
2. Verify that the loaded data is a mach-o binary by finding the mach-o magic number in the data.  
3. Parse the mach-o header from the location of the magic in the data.  
4. Get the number of load commands and parse them storing them for later use.  
5. Parse all commands into segments by comparing the command type of each load command with the corresponding segment identifier.  
6. For each segment parse its sections and store them for later use.  
7. Get the symbol table segment and locate all of its strings and symbols, creating nlist structures with each reference.  
8. Detect the cpu type from the parsed mach-o header.
9. Disassemble all executable code from each segments sections for the cpu type from the mach-o header and store the instructions for later use.
10. Repeat this process for each magic location in the loaded data so that all other mach-o files in the data are analyzed as well.  

## Implementing this flow in javascript

### What you need
- Logic for reading binary data as a stream with generic integer precisions
- 64-bit integer precision support, javascript by default does not support 64-bit integers in general
- Structure representation for each mach-o structure. Generally done with objects and prototypes (or in newer EScript with classes).  
- Generic binary grep operations and data conversion algorithms.  
- A way to decode processor mnemonics and opcodes into human-readable instructions.  

### Data streams
A data stream consists generally of a buffer of data, a pointer to data currently read and operations to move that pointer accross the buffer.  
Representing a c-like buffer in js is fairly easy by creating an object / class that accepts a typedArrayBuffer as argument to the constructor.  
The pointer can be a numerical property of our object / class that stores the current byte index to the buffer.  
So far there is not much complexity in this, but we also want a way to read data from the stream with generic integer precisions at the current index to the buffer.  
Javascript has a great feature for typedArrayBuffers to do this: a DataView.  
However, the dataview alone is not sufficient for reading all integer precisions required.  
Therefore a wrapper must be designed that reads integer precisions with the corresponding size instead of the default bytesize at a given position, and more importantly supports 64-bit integers.  

### Sixtyfour bit integers
Developer @5aelo created an amazing algorithm for 64-bit integer precision representation in javascript.  
Javascript supports 64-bit float values.  
This algorithm takes either a typedArray of 8 unsigned bytes to create the 64-bit object or casts the float value to a 64-bit object.  
Ofcourse the integer can never be represented as a real javascript number without losing precision unless as a float, thus the developer created logic for casting the 64-bit integer to a 64-bit integer string, bytes or 64-bit double.  
The dataview wrapper works by readinf from the typedArrayBuffer as a 64-bit float value and representing it with the Int64 object.  

### Structure representation
A simple way to represent structures is by creating objects / classes that accept a typedArrayBuffer as argument in the constructor.  
When initializing the object one can use the reader to read integers with arbitrary precision onto the properties of the structure object.  
Each time an integer is read by the reader the pointer to the current index of the stream will increase according to the integer precision being read.  
Eventually the object will fully represent a structure with all of its properties being the read values from the stream.  
The annotated example can be seen below.  

```javascript
	var ExampleStruct = function ExampleStruct(buffer = new ArrayBuffer())
	{
		var reader = new ExampleReader(buffer); // create new reader for the data
		this.id = reader.readUint32();	// reads uint32_t at index 0
		this.user = reader.readUint8(); // reads uint8_t at index 0+sizeof(uint32_t), thus 4
		this.description = reader.readString(100); // reads 100 bytes at index 4 + sizeof(uint8_t), thus 5
	};
	var example = new ExampleStruct(exampleBinary);
	console.log(example.description); //e.g: example binary
```

### Grepping and converting data

#### Converting strings to buffers and vice-versa
We want to be able to quickly convert strings to buffers or uint8 arrays.  
To do this we extend the prototype chain of String.  
We know that javascript has support for getting character codes at the position of a string.  
Therefore the logic is simple.  
We need to create a new uint8array with the length of the string, because a character is the same as one byte (uint8).  
After that we start looping through each character of the string and requesting its character code storing that number in the uint8array.  
In the end we either return the buffer of the uint8 array or the array itself.   
The annotated example can be seen below.  

```javascript
	String.prototype.asBuffer = function()
	{
		var u8 = new Uint8Array(this.length);
		for(i = 0; i < u8.byteLength; i++) // loop through characters in the string
		{
			u8[i] = this.charCodeAt(i); // store charcode (uint8) in the array
		}
		return u8.buffer; // return the buffer of the array (with the charcodes)
	};
	ArrayBuffer.prototype.asString = function()
	{
		return String.fromCharCode(...new Uint8Array(this)); // buffer to array, array to string
	};
```

The same logic applies when converting a buffer back to a string, its this process but in reverse order. 

#### Grepping or seeking data in a buffer
There are many ways to find data in a buffer but none of it is as fast as using indexOf().  
To aid finding the data we can use an uint8array for the buffer.  
The search pattern should also be a string.  
```javascript
	function find(buffer){
		return buffer.asString().indexOf(patternString); // returns the index of the pattern or -1
	}
```

### Decoding mnemonics and opcodes to instructions
#### Machine Code and Decoding
Generally machinecode in hexadecimal in a binary is encoded with hints.  
These hints can be used to decode the instructions and represent the logic of the code in human readable processor instructions.  
The encoding and hints work differently per processor architecture which makes disassembly a hard process for the programmer.  
However, the theory for 32-bit arm is for example that an encoded instruction is 32-bit in hex.  
The 32-bit hex its first bit is 0xE.  
Based of many logical operands and the rest of the bits one can derrive how to read the next data and what the mnemonic / opcodes are belonging to the encoded instruction.  
It would take a lot of algorithmic skills to reproduce this in javascript and hours of reading the ARM assembly manual.  
Nevertheless 64-bit ARMv8 is even more complex and it would be way cooler to support more architectures now that the mach-o is parsed. 

#### Capstone Disassembler
Luckily a fork existed on GitHub of disassembler framework called Capstone.  
Capstone is licensed under the free and open BSD license allowing anyone to use the code.  
If you want learn more about Capstone pay a visit to [their website](http://www.capstone-engine.org/).  
The fork of it was for emscripten, a way to assemble bitcode (c and c++ for example) to javascript or web assembly.  
The fork had some issues because there was a memory limit, making disassembly of large sections fail.  
Updating the fork with new flags and some code changes fixed that, as the ALLOW_MEMORY_GROWTH=1 flag deals with memory growth of the simulated heap that emscripten creates automatically at runtime.  
Capstone is fairly easy to implement and it can decode for many processor architectures.  
Using it was as easy as creating a new instance with the correct architecture and endianess flags.  
After that disassembly can be done by simply passing a bytearray of instructions.  
The instructions can be tweaked a bit to make them even more human-readable by adding some newlines after return instructions etc.  
The updated fork of capstone is on my (@userlandkernel) GitHub.  
Example use of capstone is demonstrated below.  

```javascript
	var raw = new Uint8Array(machineCodeBuffer); //e.g ARMv8 (64-bit) machinecode in a typedArrayBuffer
	var capst = cs.Capstone(cs.ARCH_ARM64, cs.MODE_LITTLE_ENDIAN); //initialize the disassembler
	var insts = capst.disasm(raw); // disassemble the machinecode
	for(instruction of insts) //print all instructions
	{
		console.log(instruction.address+': '+instruction.mnemonic + ' '+instruction.op_str); //e.g 0x1337: stp x16, x17, [sp, #-0x10]!
	}
```

### Compiling capstone with emscripten
1. Get emscripten, preferrably from source and on linux
2. Get the new fastcomp and follow emscripten's tutorial in the FAQ to set it up.
3. Initialize and activate the emscripten sdk, add it to your path
4. Clone capstone from my repo
5. in the repo clone, in build.py one can see the flags passed to emscripten, add -s ASSERTIONS=1 to check for explicit compiler errors / warnings
6. Use grunt build (which you can get with: sudo npm install grunt-cli) to build.  
7. The source code will be in dst/
8. Move the capstone.min.js file in dst/ to your project to use it. 
