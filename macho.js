/*
 * MachO javascript
 * Written by Kudima, extended by Sem Voigtländer.
*/

var MachOException = function MachOException(msg=''){
	this.message = msg.toString(16);
	this.stack = (new Error()).stack;
	this.name = "MachOException";
};

// @class MachO
var MachO = function (data) {
	this.data = data;
	this.reader = new DataReader(data);
	this.symtab = null;
};

// XXX: we should cache all the loads like symbols table, commands etc.
// cause rereading the symbols table might take a while

MachO.HEADER_SIZE  = 0x10;
MachO.CMD_SIZE	   = 0x48;
MachO.SECTION_SIZE = 0x50;
MachO.CMD_SYMTAB     = 2;
MachO.CMD_DYSYMTAB   = 0xB;
MachO.CMD_SEGMENT_64 = 0x19;
MachO.CMD_DYLD_INFO  = 0x80000022
MachO.CMD_ID_DYLIB    = 0xD;
MachO.S_NON_LAZY_SYMBOL_POINTERS = 0x6;
MachO.S_LAZY_SYMBOL_POINTERS = 0x7;
MachO.SECTION_TYPE   = 0x000000ff
MachO.PTR_SIZE = 8;

MachO.assert = function(condition, msg='')
{
	if(!condition)
	{
		throw new MachOException("assert/failure: "+msg);
	}
};

var LoadCommand = function(reader) {
	this.cmd  = reader.getUint32();
	this.size = reader.getUint32();
	this.data = reader.getBlob(this.size - 8);
};

var MachHeader = function(reader) {
	this.magic	  = reader.getUint32(); //e.g: 0xfeedface
	this.cpu	  = reader.getUint32(); // e.g: 0x100000c (means 64-bit ARM)
	this.cpu2	  = reader.getUint32(); 
	this.type	  = reader.getUint32(); // e.g: kext
	this.ncmds	  = reader.getUint32(); // number of load commands
	this.cmdsSize = reader.getUint32(); // total size of load commands together
	this.flags	  = reader.getUint32(); // flags
	this.res	  = reader.getUint32(); // reserved, we don't use this generally
};

var Nlist64 = function(reader) {
	this.n_strx = reader.getUint32(); // index in the string table
	this.n_type = reader.getUint8(); // e.g: 15 (symbol)
	this.n_sect = reader.getUint8(); // section
	this.n_desc = reader.getUint16(); // description
	this.n_value = reader.getF64(); // the offset of the symbol
};

var DyldInfoCommand = function(cmd) {
	MachO.assert(cmd.cmd == MachO.CMD_DYLD_INFO, "DYLD_INFO cmd != 0x80000022");
	var reader = new DataReader(cmd.data);
	this.__cmd = cmd;
	this.rebase_off = reader.getUint32();
	this.rebase_size = reader.getUint32();
	this.bind_off = reader.getUint32();
	this.bind_size = reader.getUint32();
	this.weak_bind_off = reader.getUint32();
	this.weak_bind_size = reader.getUint32();
	this.lazy_bind_off = reader.getUint32();
	this.lazy_bind_size = reader.getUint32();
	this.export_off = reader.getUint32();
	this.export_size = reader.getUint32();
};


DyldInfoCommand.prototype.getExportsData = function (mach) {
	return mach.reader.getBlobAtOffset(this.export_off, this.export_size);
};

var DylibIDCommand = function (cmd) {

	MachO.assert(cmd.cmd == MachO.CMD_ID_DYLIB, "LC_ID_DYLIB cmd != 0xD");
	var reader = new DataReader(cmd.data);
	this.__cmd = cmd;
	this.name_offset = reader.getUint32();
	this.timestamp = reader.getUint32();
	this.current_version = reader.getUint32();
	this.compatibility_version = reader.getUint32();
	// the offset if from the start of the command,
	// and the data we get starts after command header which
	// is 8 bytes long
	this.name = reader.getStrAt(this.name_offset - 8);
};


var SymbolTableCommand = function (cmd) {

	MachO.assert(cmd.cmd == MachO.CMD_SYMTAB, "LC_SYMTAB cmd != 2");
	var reader = new DataReader(cmd.data);
	this.__cmd = cmd;
	this.symoff   = reader.getUint32(); // Offset of the symbol
	this.nsyms	  = reader.getUint32(); // Number of symbols
	this.stroff   = reader.getUint32(); // Offset of the string
	this.strsize  = reader.getUint32(); // Length of the string
};


SymbolTableCommand.prototype.loadStrings = function (data) {

	var reader = new DataReader(data);
	reader.move(this.stroff);
	this.strings = [];
	for (var i=0; reader.pos < this.stroff + this.strsize; i++) {
		this.strings[i] = reader.getStr();
	}
};

SymbolTableCommand.prototype.loadSymbols = function (data) {

	var reader = new DataReader(data);
	reader.move(this.symoff);

	this.nlists = [];
	
	for (var i=0; i< this.nsyms; i++) {
		let nlist = new Nlist64(reader);
		nlist.name = reader.getStrAt(this.stroff + nlist.n_strx);
		this.nlists.push(nlist);
	}
};

SymbolTableCommand.prototype.getByIndex = function(idx) {

	if (idx > this.nlists.length) 
		return "<error>";
	return this.nlists[idx].name; // Get string at index
};

var DynamicSymbolTableCommand = function (cmd) {

	MachO.assert(cmd.cmd == MachO.CMD_DYSYMTAB,"LC_SYMTAB cmd != 0xB");
	var reader = new DataReader(cmd.data);
	this.__cmd = cmd;
	this.ilocalsym = reader.getUint32();
	this.nlocalsym = reader.getUint32();
	this.iextdefsym = reader.getUint32();
	this.nextdefsym = reader.getUint32();
	this.iundefsym = reader.getUint32();
	this.nundefsym = reader.getUint32();
	this.tocoff = reader.getUint32();
	this.ntoc = reader.getUint32();
	this.modtaboff = reader.getUint32();
	this.nmodtab = reader.getUint32();
	this.extrefsymoff = reader.getUint32();
	this.nextrefsyms = reader.getUint32();
	this.indirectsymoff = reader.getUint32();
	this.nindirectsyms = reader.getUint32();
	this.extreloff = reader.getUint32();
	this.nextrel = reader.getUint32();
	this.locreloff = reader.getUint32();
	this.nlocrel = reader.getUint32();
};


var SegmentCommand64 = function (cmd) {
	MachO.assert(cmd.cmd == MachO.CMD_SEGMENT_64);
	var reader = new DataReader(cmd.data);
	this.__cmd = cmd;
	this.segname = reader.getStrAt(0);
	reader.skip(0x10);
	this.vmaddr = reader.getF64();
	this.vmsize = reader.getF64();
	this.fileoff = reader.getF64();
	this.filesize = reader.getF64();
	this.maxprot = reader.getUint32();
	this.initprot = reader.getUint32();
	this.nsects = reader.getUint32();
	this.flags = reader.getUint32();
	this.sections = [];
	for (var i=0; i<this.nsects; i++) {
		this.sections[i] = new Section64(reader.getBlob(MachO.SECTION_SIZE));
	}
};

var Section64 = function (data) {
	var reader = new DataReader(data);
	this.sectname = reader.getStrAt(0);
	reader.skip(0x10);
	this.segname = reader.getStrAt(0x10);
	reader.skip(0x10);
	this.addr = reader.getF64();
	this.size = reader.getF64();
	this.offset = reader.getUint32();
	this.align = reader.getUint32();
	this.reloff = reader.getUint32();
	this.nreloc = reader.getUint32();
	this.flags = reader.getUint32();
	this.reserved1 = reader.getUint32();
	this.reserved2 = reader.getUint32();
	this.reserved3 = reader.getUint32();
};




MachO.prototype.parseHeader = function () {
	this.header = new MachHeader(this.reader);
	this.cmds	= [];

	for (var i=0; i<this.header.ncmds && i < 300; i++) {
		this.cmds[i] = new LoadCommand(this.reader);
	}
};

MachO.prototype.get_SYMTAB = function () {

	if (this.symtab != null) return this.symtab;

	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SYMTAB) {
			this.symtab = new SymbolTableCommand(cmd);
			return this.symtab;
		}
	}
};

MachO.prototype.get_DYSYMTAB = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_DYSYMTAB) {
			return new DynamicSymbolTableCommand(cmd);
		}
	} 
};

MachO.prototype.get_DYLD_INFO = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_DYLD_INFO) {
			return new DyldInfoCommand(cmd);
		}
	} 
};

MachO.prototype.getTEXT = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			var lc_segment = new SegmentCommand64(cmd)
			if (lc_segment.segname == "__TEXT") {
				return lc_segment;
			}
		}
	}
}

MachO.prototype.get_SEGMENT_64 = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			return new SegmentCommand64(cmd);
		}
	} 
};

MachO.prototype.get_LINKEDIT = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			var segment = new SegmentCommand64(cmd);
			if(segment.segname == "__LINKEDIT") {
				return segment;
			}
		}
	}
};

MachO.prototype.getSection_NON_LAZY_SYMBOL_POINTERS = function *() {

	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			var segment = new SegmentCommand64(cmd);
			for (section of segment.sections) {
				if ((section.flags & MachO.SECTION_TYPE) ==
						MachO.S_NON_LAZY_SYMBOL_POINTERS) 
					yield section;
			}
		}
	}
};

MachO.prototype.getSection_LAZY_SYMBOL_POINTERS = function *() {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			var segment = new SegmentCommand64(cmd);
			for (section of segment.sections) {
				if ((section.flags & MachO.SECTION_TYPE) ==
						MachO.S_LAZY_SYMBOL_POINTERS) 
					yield section;
			}
		}
	}
};

MachO.prototype.nonLazySymbolAddr = function (name) {

	for (var got of this.getSection_NON_LAZY_SYMBOL_POINTERS()) {
		var offsetInIndirect = got.reserved1;
		var dyn = this.get_DYSYMTAB();
		var reader = new DataReader(this.data);
		reader.move(dyn.indirectsymoff + offsetInIndirect * 4);
		var syms = this.get_SYMTAB();
		syms.loadSymbols(this.data);
		// XXX: we assume size is small enough to fit into lo of the size
		if (binHelper.f64hi(got.size) != 0) {
			throw MachOException("got size is out of bounds");
		}
		for (var i=0; i < binHelper.f64lo(got.size)/MachO.PTR_SIZE; i++) {
			var idx = reader.getUint32();
			sym = syms.getByIndex(idx);
			if (sym == name) {
				return got.addr + binHelper.toF64(0, MachO.PTR_SIZE*i);
			}
		}
	}
};

MachO.prototype.getLocalSym = function (name) {
	var syms = this.get_SYMTAB();
	syms.loadSymbols(this.data);
	for (var i=0; i<syms.nlists.length; i++) {
		let nlist = syms.nlists[i];
		if (name == nlist.name) {
			return nlist.n_value;
		}
	}
};

MachO.prototype.lazySymbolAddr = function (name) {
	for (var la_symbol_ptr of this.getSection_LAZY_SYMBOL_POINTERS()) {
		var offsetInIndirect = la_symbol_ptr.reserved1;
		var dyn = this.get_DYSYMTAB();
		var reader = new DataReader(this.data);
		reader.move(dyn.indirectsymoff + offsetInIndirect * 4);
		var syms = this.get_SYMTAB();
		syms.loadSymbols(this.data);
		// XXX: we assume size is small enough to fit into lo of the size
		if (binHelper.f64hi(la_symbol_ptr.size) != 0) {
			throw MachOException("la_symbol_ptr size is out of bounds");
		}
		for (var i=0; i < binHelper.f64lo(la_symbol_ptr.size)/MachO.PTR_SIZE; i++) {
			var idx = reader.getUint32();
			sym = syms.getByIndex(idx);
			if (sym == name) {
				return la_symbol_ptr.addr + binHelper.toF64(0, MachO.PTR_SIZE*i);
			}
		}
	}
};

MachO.prototype.getLinkeditStartInProcess = function (slide) {
	var linkedit = this.get_LINKEDIT();
	var dyld_info  = this.get_DYLD_INFO();
	var offsetInLinkedit = binHelper.toF64(0, dyld_info.export_off) - linkedit.fileoff;
	var linkeditStart = linkedit.vmaddr + slide;
	return linkeditStart + offsetInLinkedit;
};

MachO.prototype.getLinkeditStartInFile = function () {
	let dyld_info  = this.get_DYLD_INFO();
	return dyld_info.export_off;
};

// retrieves a record from Linkedit which is the
// offset of the symbol counted from the library loading
// address
MachO.findSymbolInLinkedit = function(data, symbol) {
	var reader = new DataReader(data);
	var symbolReader = new DataReader(binHelper.asciiToUint8Array(symbol));
	while (true) {
		var terminalSize = reader.getUint8();
		MachO.assert(terminalSize <= 127, "No re-export");
		if (symbolReader.bytesLeft() == 0 && terminalSize != 0) {
			// skip flags
			reader.getUint8();
			var result = reader.F64uleb128();
			return result;
		}
		reader.skip(terminalSize);
		var childrenRemaining = reader.getUint8();
		var nodeOffset = 0;
		var symbolPos = symbolReader.pos;
		for (;childrenRemaining > 0; childrenRemaining--) {
			var wrongEdge = false;
			var ch = reader.getUint8();
			while (ch != 0) {
				if ( !wrongEdge ) {
					if ( ch != symbolReader.getUint8() ) {
						wrongEdge = true;
					}
				}
				ch = reader.getUint8();
			}
			if (wrongEdge) {
				symbolReader.reset(symbolPos);
				while ((reader.getUint8() & 0x80) != 0);
			} else {
				nodeOffset = reader.U32uleb128();
				break;
			}
		}
		if (nodeOffset != 0) {
			// XXX: check if nodeOffset is too big
			reader.reset(nodeOffset);
		} else {
			break;
		}
	}
};

MachO.prototype.getName = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_ID_DYLIB) {
			let id = new DylibIDCommand(cmd);
			return id.name;
		}
	} 
};

MachO.prototype.findSym = function(sym = '')
{
	if(!this.header)
	{
		this.parseHeader();
	}
	if(!this.symtab){
		this.get_SYMTAB();
	}
	if(!this.symtab.nlists)
	{
		this.symtab.loadSymbols(this.data);
	}
	if(!this.symtab.strings)
	{
		this.symtab.loadStrings(this.data);
	}
	for(i = 0; i < this.symtab.nsyms; i++) {
		var entry = this.symtab.nlists[i];
		if(entry.name == sym && entry.n_type == 15) {
			return entry.n_value;
		}
	}
};

MachO.prototype.guessSyms = function()
{
	var syms = [];
	try{
		if(!this.header)
		{
			this.parseHeader();
		}
		if(!this.symtab){
			this.get_SYMTAB();
		}
		if(!this.symtab)
		{
			return syms;
		}
		if(!this.symtab.strings)
		{
			this.symtab.loadStrings(this.data);
		}
		if(!this.symtab.nlists)
		{
			this.symtab.loadSymbols(this.data);
		}

		for(i = 0; i < this.symtab.nsyms; i++) {
			var entry = this.symtab.nlists[i];
			if(entry.name && entry.n_value && (entry.n_type == 15))
			{
				syms.push({name: entry.name, off: entry.n_value});
			}
		}
	}
	catch(err)
	{
		console.error("Failed to guess syms: "+err.message);
	}
	return syms;
};

MachO.prototype.getSegments = function()
{
	if(!this.cmds){
		return;
	}
	this.segments = [];
	for(i = 0; i < this.cmds.length; i++) {
		var lc = this.cmds[i];
		if(lc.cmd != LC_SEGMENT_64) {
			continue;
		}
		var sc = new SegmentCommand64(lc);
		this.segments.push(sc);
	}
};

MachO.prototype.getSegment = function(name = '')
{
	if(!this.segments)
	{
		this.getSegments();
	}
	if(!this.segments){
		return;
	}
	for(i = 0; i < this.segments.length; i++) {
		var sc = this.segments[i];
		if(sc.segname == name) {
			return sc;
		}
	}
};

MachO.prototype.findCodeSegment = function()
{
	for(i = 0; i < this.segments.length; i++) {
		var sc = this.segments[i];
		var prot = VM_PROT_READ | VM_PROT_EXECUTE;
		if((sc.initprot & prot) != prot) {
			continue;
		}
		return sc;
	}
};




var MachoTool = function MachoTool(filename = '', buffer = new ArrayBuffer())
{
	this.filename = filename; // The filename as provided from the input element
	this.buffer = buffer;
	this.macho = new MachO(this.buffer); // A new macho instance from the data in the arraybuffer
	this.symbols = ''; // Cache of symbols
	this.sections = ''; // Cache of sections
	this.segments = '';
	this.instructions = '';
	this.getEndianess();
	this.macho.parseHeader();
	this.getArch();
	this.macho.get_SYMTAB();
	this.macho.getSegments();

	// Load and guess all symbols
	this.getSymbols();
	this.getSegments();
	
};

MachoTool.bloblink = function(str = '')
{
	return window.URL.createObjectURL(
		new Blob([
			new TextEncoder().encode(str)],
			{
				type:'text/plain'
			}
		)
	);
};

MachoTool.prototype.reparse = function()
{
	this.macho = new MachO(this.buffer);
	this.symbols = '';
	this.segments = '';
	this.sections = '';
	this.instructions = '';
	this.getEndianess();
	this.macho.parseHeader();
	this.getArch();
	this.macho.get_SYMTAB();
	this.macho.getSegments();
	this.getSegments();
	this.getSymbols();
};

MachoTool.prototype.getSymbols = function()
{
	this.macho.symbols = this.macho.guessSyms();
	if(this.macho.symbols) {

		for(i = 0; i < this.macho.symbols.length; i++) {
			if(this.macho.symbols[i].off.toString(16) != '0x0000000000000000')
			{
				this.symbols += '#define '+ this.macho.symbols[i].name +' '+ this.macho.symbols[i].off.toString(16)+'\n';
			}
		}
	}
};

MachoTool.prototype.getSegments = function()
{
	if(this.macho.segments){

		// Gets the sectons and segments
		for(i = 0; i < this.macho.segments.length; i++){
			this.segments += this.macho.segments[i].segname+': '+this.macho.segments[i].vmaddr.toString(16)+'\n';
			for(j = 0; j < this.macho.segments[i].sections.length; j++){
				if(!this.sections)
				{
					this.sections = '';
				}
				this.sections+=(this.macho.segments[i].segname+"."+this.macho.segments[i].sections[j].sectname +': '+this.macho.segments[i].sections[j].addr.toString(16)+'\n');
			}
		}
	}
};

MachoTool.prototype.getArch = function()
{
	switch(lastbit(this.macho.header.magic))
	{
		case 0xf:
			console.info("Detected 64-bit mach-o");
			this.arch = cs.ARCH_ARM64;
			break;

		case 0xe:
			console.info("Detected 32-bit mach-o");
			this.arch = cs.ARCH_ARM;
			break;

		default:
			console.warn("Unable to detect architecture, are you sure this is mach-o?");
			this.arch = 'unknown';
			break;
	}
	return this.arch;
};

MachoTool.prototype.getEndianess = function()
{
	var m = this.macho.reader.view.view.getUint32(0);
	switch(m){
		case 0xfeedface:
			console.info("Detected MSB mach-o");
			this.endianess = cs.MODE_BIG_ENDIAN;
			break;
		case 0xfeedfacf:
			console.info("Detected MSB mach-o");
			this.endianess = cs.MODE_BIG_ENDIAN;
			break;
		case 0xcefaedfe:
			console.info("Detected LSB mach-o");
			this.endianess = cs.MODE_LITTLE_ENDIAN;
			break;
		case 0xcffaedfe:
			console.info("Detected LSB mach-o");
			this.endianess = cs.MODE_LITTLE_ENDIAN;
			break;

		default:
			console.warn("Unable to detect endianess, are you sure this is mach-o?");
			this.endianess = 'unknown';
			break;
	}
	return this.endianess;	
};

MachoTool.prototype.disasmSegment = function(segname='')
{
	var _failmsg = "Failed to disassemble ";
	var seg = this.macho.getSegment(segname); //retrieve the segment with the given name
	if(!seg)
	{
		console.info("No such segment: '"+segname+"'."); //the segment must be found otherwise we have nothing to disassemble
		return;
	}
	
	try {
		console.info("Disassembling "+seg.segname);

		// We want to attempt the disassembly of all sections in the given segment
		for(var i = 0; i < seg.nsects; i++) {
			console.info("Initialized capstone for "+seg.segname+'.'+seg.sections[i].sectname);
			
			var capst = new cs.Capstone(this.arch, this.endianess); // Initialize the disassembler
			
			var sect = seg.sections[i]; //store the current section

			var maxsize = sect.size.asInt32(); //get the size of the section, remember this is an Int64 casted to an int32
	//		if(maxsize > UINT32_MAX) {
		//		maxsize = UINT32_MAX; // If we exceed this size errors will start to occur and capstone will fail
		//	}

			var instructions = [];

			// Not all sections contain code
			// Luckily we can be lazy as capstone disassembly will fail when the section does not
			// We simply handle the exception and skip the section
			try {
				var code = this.macho.reader.getBlobAtOffset(sect.offset, maxsize); // We only need to disassemble the section
				instructions = capst.disasm(code, maxsize, 0);
			}
			catch(x) {
				console.info("Skipping "+seg.segname+'.'+seg.sections[i].sectname);
				console.log(x);
				continue;
			}

			var instlines = []; // We temporary need to store all instructions

			console.info("Closed capstone for "+seg.segname+'.'+seg.sections[i].sectname);
			capst.close(); // The disassembler is not needed anymore at this point, we can terminate it to refresh memory

			// We need to loop through each instruction to see if it is a function with a symbol
			for(j = 0; j < instructions.length; j++) {
				var inst = instructions[j];
				var addr = Add(sect.addr, new Int64(inst.address)).toString(16); // We want to have the real address, not the limited one
	   			var fname = '';
	   			
	   			try{
	   				fname = this.symbols.slice(this.symbols.indexOf(addr)-(addr.length),(addr.length)).split(' ')[1]; // try to get the name of the symbol for the current address
	   			}
	   			catch(ex)
	   			{
	   				console.log(ex); // we do not seem to have a symbol for the address
	   				fname = '';
	   			}

	   			if(fname){
	   				addr = '\n\n'+fname+'\n'+addr;
	   			}
	   			if(inst.mnemonic=='ret'){
	   				inst.op_str+='\n';
	   			}
	   			instlines.push(addr+': '+inst.mnemonic+ ' '+inst.op_str);
			}
			if(instlines.length){
				this.instructions += sect.segname+'.'+sect.sectname+': \n\n'+instlines.join('\n')+'\n\n';
			}
		}
	} 
	catch(err)
	{
		console.warn(_failmsg+seg.segname+": "+err.message+'\n'+err.stack);
		throw err;
	}

	
};

MachoTool.prototype.disasmAll = function(stdout)
{
	this.instructions = '';
	this.disasm();
	for(macho of this.machos){

		if(!macho.macho.cmds){
			return;
		}
		macho.instructions=macho.filename+'\n'+(('-').repeat(20))+'\n';
		for(var seg of macho.macho.segments) {
			macho.disasmSegment(seg.segname);
		}
		this.instructions+=macho.instructions;
	}
	stdout.src = MachoTool.bloblink(this.instructions);
};

MachoTool.prototype.disasm = function()
{
	
	if(!this.macho.cmds){
		return;
	}
	this.instructions=this.filename+'\n'+(('-').repeat(20))+'\n';
	for(var seg of this.macho.segments) {
		this.disasmSegment(seg.segname);
	}
};

MachoTool.prototype.download = function()
{
	var dlink = document.createElement('a');
	dlink.href = window.URL.createObjectURL(new Blob([this.macho.data], {type: 'application/octet-stream'}));
	dlink.download = this.filename+".patched";
	document.body.appendChild(dlink);	
	dlink.click();
	document.body.removeChild(dlink);
};

MachoTool.prototype.findMachoNames = function()
{
	if(this.machos){
		for(k = 0; k < this.machos.length; k++)
		{
			var current = this.machos[k];
			var seg = current.macho.getSegment('__TEXT');
			for(l = 0; l < seg.sections.length; l++)
			{
				var sect = seg.sections[l];
				if(sect.sectname == "__cstring")
				{
					var off = sect.offset;
					var size = sect.size.asInt32();
					var name = current.macho.data.slice(off, off+size).asString().split('\x00')[0];
					this.machos[k].filename = name;
					break;
				}
			}
		}
	}
};

MachoTool.prototype.findAllMachos = function(stdout,disasstdout)
{
	stdout.innerText = "Finding additional mach-o files...";
	this.machos = [];
	this.currentMachoNum = 0;
	this.machofinder = setInterval(
		function(mtool, stdout){
			var buf = mtool.macho.data;
			var i = mtool.currentMachoNum;
			mtool.machopercent = "("+((i/buf.byteLength)*100).toFixed(2)+"%)";
			var _threshold = 4000;
			try {
				for(j = i+_threshold; j > i; j--){
					if(mtool.currentMachoNum >= buf.byteLength){
						mtool.currentMachoNum = "done";
						stdout.innerText = "Found "+mtool.machos.length+" macho files!";
						setTimeout(function(mtool,disasstdout){mtool.findMachoNames();mtool.disasmAll(disasstdout);},0.01,mtool,disasstdout);
						clearInterval(mtool.machofinder);
						return;
					}
					var magic = new RWView(buf.slice(j, j+sizeof(uint32_t)).buffer);

					if(magic.getUint32(0, false) == 0xfeedface 
						|| magic.getUint32(0, false) == 0xfeedfacf
						|| magic.getUint32(0, true) == 0xfeedface
						|| magic.getUint32(0, true) == 0xfeedfacf
					) {
					
						mtool.machos.push(new MachoTool('macho-'+mtool.machos.length, buf.slice(j, buf.byteLength)));
						stdout.innerText = ("Found new mach-o at offset: 0x"+(j.toString(16)));
					}
				}
			}
			catch(err){
				mtool.currentMachoNum+=sizeof(uint32_t);
			}
			mtool.currentMachoNum+=(_threshold*sizeof(uint32_t));
		}, 
	0.00, this, stdout);
};

Object.AsHTML = function(obj, name) {
    var li = document.createElement("li");
    if (typeof(name) != "undefined") {
        var strong = document.createElement("strong");
        strong.appendChild(document.createTextNode(name + ": "));
        li.appendChild(strong);
    }
    if (typeof(obj) != "object"){
        li.appendChild(document.createTextNode(obj));
    } else {
        var ul = document.createElement ("ul");
        ul.setAttribute('class', 'tree');
        for (var prop in obj){
            ul.appendChild(Object.AsHTML(obj[prop],prop));
        }
        li.appendChild(ul);
    }
    return li;
};

