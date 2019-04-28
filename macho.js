var RWView = function RWView(buffer, byteOffset, byteLength)
{
	this.buffer = buffer;
	this.byteOffset = byteOffset;
	this.byteLength = byteLength;
};

RWView.prototype.getInt8 = function(byteOffset = 0, littleEndian = false){
	var i8 = new Int8Array(this.buffer);
	return i8[byteOffset];
};

RWView.prototype.getUint8 = function(byteOffset = 0, littleEndian = false){
	var u8 = new Uint8Array(this.buffer);
	return u8[byteOffset];
};

RWView.prototype.getInt16 = function(byteOffset = 0, littleEndian = false){
	var i16 = new Int16Array(this.buffer);
	return i16[Math.floor(byteOffset/2)];
};

RWView.prototype.getUint16 = function(byteOffset = 0, littleEndian = false){
	var u16 = new Uint16Array(this.buffer);
	return u16[Math.floor(byteOffset/2)];
};

RWView.prototype.getInt32 = function(byteOffset = 0, littleEndian = false){
	var i32 = new Int32Array(this.buffer);
	return i32[Math.floor(byteOffset/4)];
};

RWView.prototype.getUint32 = function(byteOffset = 0, littleEndian = false)
{
	var u32 = new Uint32Array(this.buffer);
	return u32[Math.floor(byteOffset/4)];
};

RWView.prototype.getFloat32 = function(byteOffset = 0, littleEndian = false)
{
	var f32 = new Float32Array(this.buffer);
	return f32[Math.floor(byteOffset/4)];
};

RWView.prototype.getFloat64 = function(byteOffset = 0, littleEndian = false)
{
	var f64 = new Float64Array(this.buffer);
	return f64[Math.floor(byteOffset/8)];
};

RWView.prototype.getInt64 = function(byteOffset = 0, littleEndian = false)
{
	byteOffset = byteOffset*8; // 8
	var b1 = new Uint8Array(this.buffer)[byteOffset];
	var b2 = new Uint8Array(this.buffer)[byteOffset+1];
	var b3 = new Uint8Array(this.buffer)[byteOffset+2];
	var b4 = new Uint8Array(this.buffer)[byteOffset+3];
	var b5 = new Uint8Array(this.buffer)[byteOffset+4];
	var b6 = new Uint8Array(this.buffer)[byteOffset+5];
	var b7 = new Uint8Array(this.buffer)[byteOffset+6];
	var b8 = new Uint8Array(this.buffer)[byteOffset+7];
	//8 bytes, one byte is 8 bits. 8 times 8 equals 64 bits in total.
	return new Int64([b1, b2, b3, b4, b5, b6, b7, b8]);
};

RWView.prototype.setInt8 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Int8Array(this.buffer)[byteOffset] = value;
};

RWView.prototype.setUint8 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Uint8Array(this.buffer)[byteOffset] = value;
};

RWView.prototype.setInt16 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Int16Array(this.buffer)[Math.floor(byteOffset/2)] = value;
};

RWView.prototype.setUint16 =function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Uint16Array(this.buffer)[Math.floor(byteOffset/2)] = value;
};

RWView.prototype.setInt32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Int32Array(this.buffer)[Math.floor(byteOffset/4)] = value;
};

RWView.prototype.setUint32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Uint32Array(this.buffer)[Math.floor(byteOffset/4)] = value;
};

RWView.prototype.setFloat32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Float32Array(this.buffer)[Math.floor(byteOffset/4)] = value;
};

RWView.prototype.setFloat64 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	new Float64Array(this.buffer)[Math.floor(byteOffset/8)] = value;
};

RWView.prototype.setInt64 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	if(!(value instanceof Int64)) {
		value = new Int64(value);
	}

	var bytes = value.getBytes();
	for(i = 0; i< bytes.length; i++) {
		new Int8Array(this.buffer)[i] = bytes[i];
	}
};

function MachOException(msg = '') {
	this.message = msg.toString(16);
	this.stack = (new Error()).stack;
};
MachOException.prototype = Object.create(Error.prototype);
MachOException.prototype.name = "MachOException";

var MachoReader = function(data) {
	this.view = new RWView(data.buffer, data.byteOffset, data.byteLength);
	this.data = data;
	this.pos = 0;
};

MachoReader.prototype.getUint32 = function () {
	this.pos += 4;
	return this.view.getUint32(this.pos - 4, true);
}

MachoReader.prototype.getUint16 = function () {
	this.pos += 2;
	return this.view.getUint16(this.pos - 2, true);
}

MachoReader.prototype.getUint8 = function () {
	this.pos += 1;
	return this.view.getUint8(this.pos - 1, true);
}

MachoReader.prototype.getF64 = function () {
	this.pos += 8;
	return Int64.fromDouble(this.view.getFloat64(this.pos - 8, true));
}

MachoReader.prototype.getBlob = function(size) {
	this.pos += size;
	var result = this.data.slice(this.pos - size, this.pos);
	return result;
}

MachoReader.prototype.getBlobAtOffset = function(offset, size) {

	var result = this.data.slice(offset, offset + size);
	return result;
}

MachoReader.prototype.atU8 = function(pos=0) {
	return this.view.getUint8(this.pos + pos);
}

MachoReader.prototype.reset = function(pos) {
	this.pos = pos;
}

function lshiftU32Array(u32arr, shift) {

	u32arr[0] = u32arr[0] << shift;

	let extra = u32arr[1] & (0xffffffff << (32-shift));
	extra = extra >> (32 - shift);

	u32arr[0] = u32arr[0] & extra;
	u32arr[1] = u32arr[1] << shift;
}

MachoReader.prototype.F64uleb128 = function () {

	let result = 0.0;

	var bytes = new Uint8Array(8);
	var i=0;

	for (; i<8; i++) {
		let b = this.getUint8();
		bytes[i] = b;
		if ((b & 0x80) != 0x80) 
			break;
	}

	let shift  = 0;
	for (;i>=0; i--) {

		let b = bytes[i];

		result = binHelper.lshiftF64(result, 7);
		result = binHelper.f64OrLo(result, b & 0x7f);

		if (shift > 64)
			break;

		shift += 7;
	}

	return result;
}

MachoReader.prototype.U32uleb128 = function () {

	let result = 0.0;
	let shift  = 0;

	while (1) {
		let b = this.getUint8();
		result = result | ((b & 0x7f) << shift);

		if ( ((b & 0x80) != 0x80) || shift > 24)
			break;

		shift += 7;
	}

	return result;
}

MachoReader.prototype.bytesLeft = function () {
	return this.data.length - this.pos;
}

// read a null-terminated string
MachoReader.prototype.getStr = function() {

	let end = this.data.indexOf(0, this.pos);

	let arr = Array.from(this.data.slice(this.pos, end));
	this.pos = end+1;

	return String.fromCharCode(...arr);
}

MachoReader.prototype.getStrAt = function(pos) {

	let end = this.data.indexOf(0, pos);

	let arr = Array.from(this.data.slice(pos, end));
	return String.fromCharCode(...arr);
}

MachoReader.prototype.skip = function(len) {
	this.pos += len;
}

MachoReader.prototype.move = function (pos) {
	this.pos = pos;
}

// MachO structs
var MachO_LC = function (reader) {
	this.cmd  = reader.getUint32();
	this.size = reader.getUint32();
	this.data = reader.getBlob(this.size - 8);
}

var MachO_HEADER = function(reader) {
	this.magic	  = reader.getUint32();
	this.cpu	  = reader.getUint32();
	this.cpu2	  = reader.getUint32();
	this.type	  = reader.getUint32();
	this.ncmds	  = reader.getUint32();
	this.cmdsSize = reader.getUint32();
	this.flasg	  = reader.getUint32();
	this.res	  = reader.getUint32();
}

var nlist_64 = function (reader) {
	this.n_strx = reader.getUint32();
	this.n_type = reader.getUint8();
	this.n_sect = reader.getUint8();
	this.n_desc = reader.getUint16();
	this.n_value = reader.getF64();
}

var MachO_LC_DYLD_INFO = function(cmd) {

	if (cmd.cmd != MachO.CMD_DYLD_INFO) throw new MachOException("DYLD_INFO cmd != 0x80000022");

	var reader = new MachoReader(cmd.data);
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
}

MachO_LC_DYLD_INFO.prototype.getExportsData = function (mach) {
	return mach.reader.getBlobAtOffset(this.export_off, this.export_size);
}

MachO_LC_ID_DYLIB = function (cmd) {

	if (cmd.cmd != MachO.CMD_ID_DYLIB) throw new MachOException("LC_ID_DYLIB cmd != 0xD");

	var reader = new MachoReader(cmd.data);

	this.__cmd = cmd;
	this.name_offset = reader.getUint32();
	this.timestamp = reader.getUint32();
	this.current_version = reader.getUint32();
	this.compatibility_version = reader.getUint32();

	// the offset if from the start of the command,
	// and the data we get starts after command header which
	// is 8 bytes long
	this.name = reader.getStrAt(this.name_offset - 8);
}

var MachO_LC_SYMTAB = function (cmd) {

	if (cmd.cmd != 2) throw new MachOException("LC_SYMTAB cmd != 2");

	var reader = new MachoReader(cmd.data);
	this.__cmd = cmd;
	this.symoff   = reader.getUint32();
	this.nsyms	  = reader.getUint32();
	this.stroff   = reader.getUint32();
	this.strsize  = reader.getUint32();
}

MachO_LC_SYMTAB.prototype.loadStrings = function (mach) {

	var reader = new MachoReader(mach.data);
	reader.move(this.stroff);

	this.strings = [];

	for (var i=0; reader.pos < this.stroff + this.strsize; i++) {
		this.strings[i] = reader.getStr();
	}
}

MachO_LC_SYMTAB.prototype.loadSymbols = function (data) {

	var reader = new MachoReader(data);
	reader.move(this.symoff);

	this.nlists = [];

	for (var i=0; i<this.nsyms; i++) {
		let nlist = new nlist_64(reader);
		nlist.name = reader.getStrAt(this.stroff + nlist.n_strx);
		this.nlists.push(nlist);
	}
}

MachO_LC_SYMTAB.prototype.getByIndex = function(idx) {

	if (idx > this.nlists.length) 
		return "<error>";

	return this.nlists[idx].name;
}

MachO_LC_DYSYMTAB = function (cmd) {

	if (cmd.cmd != MachO.CMD_DYSYMTAB) throw new MachOException("LC_SYMTAB cmd != 0xB");

	var reader = new MachoReader(cmd.data);

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
}

MachO_LC_SEGMENT_64 = function (cmd) {

	if (cmd.cmd != MachO.CMD_SEGMENT_64) throw new MachOException("LC_SYMTAB cmd != 0xD");

	var reader = new MachoReader(cmd.data);

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
		this.sections[i] = new MachO_LC_SECTION_64(reader.getBlob(MachO.SECTION_SIZE));
	}
}

MachO_LC_SECTION_64 = function (data) {

	var reader = new MachoReader(data);

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
}


// @data is Uint8Array
//
var MachO = function (data) {
	this.data = data;
	this.reader = new MachoReader(data);
	this.symtab = null;
}

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


MachO.prototype.parseHeader = function () {
	this.header = new MachO_HEADER(this.reader);
	this.cmds	= [];

	for (var i=0; i<this.header.ncmds; i++) {
		this.cmds[i] = new MachO_LC(this.reader);
	}
}

MachO.prototype.get_SYMTAB = function () {

	if (this.symtab != null) return this.symtab;

	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SYMTAB) {
			this.symtab = new MachO_LC_SYMTAB(cmd);
			return this.symtab;
		}
	}
}

MachO.prototype.get_DYSYMTAB = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_DYSYMTAB) {
			return new MachO_LC_DYSYMTAB(cmd);
		}
	} 
}

MachO.prototype.get_DYLD_INFO = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_DYLD_INFO) {
			return new MachO_LC_DYLD_INFO(cmd);
		}
	} 
}

MachO.prototype.getTEXT = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			let lc_segment = new MachO_LC_SEGMENT_64(cmd)
				if (lc_segment.segname == "__TEXT") {
					return lc_segment;
				}
		}
	}
}

MachO.prototype.get_SEGMENT_64 = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			return new MachO_LC_SEGMENT_64(cmd);
		}
	} 
}

MachO.prototype.get_LINKEDIT = function () {

	for (cmd of this.cmds) {

		if (cmd.cmd == MachO.CMD_SEGMENT_64) {
			let segment = new MachO_LC_SEGMENT_64(cmd);
			if (segment.segname == "__LINKEDIT")
				return segment;
		}
	}
}

MachO.prototype.getSection_NON_LAZY_SYMBOL_POINTERS = function *() {

	for (cmd of this.cmds) {

		if (cmd.cmd == MachO.CMD_SEGMENT_64) {

			let segment = new MachO_LC_SEGMENT_64(cmd);

			for (section of segment.sections) {
				if ((section.flags & MachO.SECTION_TYPE) ==
						MachO.S_NON_LAZY_SYMBOL_POINTERS) 
					yield section;
			}
		}
	}
}

MachO.prototype.getSection_LAZY_SYMBOL_POINTERS = function *() {

	for (cmd of this.cmds) {

		if (cmd.cmd == MachO.CMD_SEGMENT_64) {

			let segment = new MachO_LC_SEGMENT_64(cmd);

			for (section of segment.sections) {
				if ((section.flags & MachO.SECTION_TYPE) ==
						MachO.S_LAZY_SYMBOL_POINTERS) 
					yield section;
			}
		}
	}
}

MachO.prototype.nonLazySymbolAddr = function (name) {

	for (let got of this.getSection_NON_LAZY_SYMBOL_POINTERS()) {

		var offsetInIndirect = got.reserved1;

		var dyn = this.get_DYSYMTAB();
		var reader = new MachoReader(this.data);
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
}

MachO.prototype.getLocalSym = function (name) {

	var syms = this.get_SYMTAB();
	syms.loadSymbols(this.data);

	for (var i=0; i<syms.nlists.length; i++) {
		let nlist = syms.nlists[i];
		if (name == nlist.name) {
			return nlist.n_value;
		}
	}
}

MachO.prototype.lazySymbolAddr = function (name) {

	for (let la_symbol_ptr of this.getSection_LAZY_SYMBOL_POINTERS()) {
		var offsetInIndirect = la_symbol_ptr.reserved1;

		var dyn = this.get_DYSYMTAB();
		var reader = new MachoReader(this.data);
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
}

MachO.prototype.getLinkeditStartInProcess = function (slide) {

	let linkedit = this.get_LINKEDIT();
	let dyld_info  = this.get_DYLD_INFO();

	let offsetInLinkedit = binHelper.toF64(0, dyld_info.export_off) - linkedit.fileoff;
	let linkeditStart = linkedit.vmaddr + slide;

	return linkeditStart + offsetInLinkedit;
}

MachO.prototype.getLinkeditStartInFile = function () {

	let dyld_info  = this.get_DYLD_INFO();
	return dyld_info.export_off;
}

// retrieves a record from Linkedit which is the
// offset of the symbol counted from the library loading
// address
function findSymbolInLinkedit(data, symbol) {

	var reader = new MachoReader(data);

	var symbolReader = new MachoReader(binHelper.asciiToUint8Array(symbol));

	while (1) {

		let terminalSize = reader.getUint8();

		if (terminalSize > 127) {
			// TODO: implement re-export case
			throw MachOException("No re-export");
		}

		if (symbolReader.bytesLeft() == 0 && terminalSize != 0) {
			// skip flags
			reader.getUint8();
			let result = reader.F64uleb128();
			return result;
		}

		reader.skip(terminalSize);

		let childrenRemaining = reader.getUint8();

		let nodeOffset = 0;

		let symbolPos = symbolReader.pos;

		for (;childrenRemaining > 0; childrenRemaining--) {
			let wrongEdge = false;

			let ch = reader.getUint8();

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
}

MachO.prototype.getName = function () {
	for (cmd of this.cmds) {
		if (cmd.cmd == MachO.CMD_ID_DYLIB) {
			let id = new MachO_LC_ID_DYLIB(cmd);
			return id.name;
		}
	} 
}

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
		this.symtab.loadStrings(this);
	}
	for(i = 0; i < this.symtab.nsyms; i++) {
		var entry = this.symtab.nlists[i];
		if(entry.name == sym) {
			return entry.n_value;
		}
	}
	
};

MachO.prototype.guessSyms = function()
{
	var syms = new Array();
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
		this.symtab.loadStrings(this);
	}
	for(i = 0; i < this.symtab.nsyms; i++) {
		var entry = this.symtab.nlists[i];
		if(entry.name && entry.n_value)
		{
			syms.push({name: entry.name, off: entry.n_value});
		}
	}
	return syms;
	
};

MachO.prototype.getSegments = function()
{
	this.segments = [];
	for(i = 0; i < this.cmds.length; i++) {
		var lc = this.cmds[i];
		if(lc.cmd != LC_SEGMENT_64) {
			continue;
		}
		var sc = new MachO_LC_SEGMENT_64(lc);
		this.segments.push(sc);
	}
};

MachO.prototype.getSegment = function(name = '')
{
	if(!this.segments)
	{
		this.getSegments();
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
	this.filename = filename;
	this.macho = new MachO(buffer);
	this.macho.parseHeader();
	this.macho.getSegments();
	this.symbols = '';
	this.sections = '';

	var _syms = this.macho.guessSyms();
	for(i = 0; i < _syms.length; i++)
	{
		this.symbols += '#define '+_syms[i].name +' '+_syms[i].off.toString(16)+'\n';
	}

	// Gets the sectons and segments
	for(i = 0; i < this.macho.segments.length; i++){
			if(!this.segments) {
				this.segments = '';
			}
			this.segments += this.macho.segments[i].segname+': '+this.macho.segments[i].vmaddr.toString(16)+'\n';
			for(j = 0; j < this.macho.segments[i].sections.length; j++){
				if(!this.sections)
				{
					this.sections = '';
				}
				this.sections+=(this.macho.segments[i].segname+"."+this.macho.segments[i].sections[j].sectname +': '+this.macho.segments[i].sections[j].addr.toString(16)+'\n');
			}
		}

	this.disasm = function()
	{
		var failmsg = "Failed to disassemble ";
		var capstone = new cs.Capstone(cs.ARCH_ARM64, cs.MODE_LITTLE_ENDIAN);
		var __TEXT_EXEC = this.macho.getSegment('__TEXT_EXEC');
		var __TEXT = this.macho.getSegment('__TEXT');
		this.instructions = '';
		if(__TEXT_EXEC) {
			try {
				var instructions = capstone.disasm(this.macho.reader.getBlobAtOffset(__TEXT_EXEC.fileoff.asInt32(), __TEXT_EXEC.vmsize.asInt32()), __TEXT_EXEC.vmsize.asInt32());
				var instlines = [];
		   		for(i = 0; i < instructions.length; i++)
		   		{
		   			instlines.push(Add(__TEXT_EXEC.vmaddr,instructions[i].address).toString(16)+': '+instructions[i].mnemonic+ ' '+instructions[i].op_str);
		   		}
		   		this.instructions += '__TEXT_EXEC: \n\n'+instlines.join('\n')+'\n\n';
			}
			catch(err)
			{
				alert(failmsg+"__TEXT_EXEC: "+err.message);
			}
		}
		if(__TEXT)
		{
			try {
				__TEXT = __TEXT.sections[0];
				var instructions = capstone.disasm(this.macho.reader.getBlobAtOffset(__TEXT.offset, __TEXT.size.asInt32()),__TEXT.addr.asInt32());
				var instlines = [];
		   		for(i = 0; i < instructions.length; i++)
		   		{
		   			instlines.push(Add(__TEXT.addr.asInt32(),instructions[i].address).toString(16)+': '+instructions[i].mnemonic+ ' '+instructions[i].op_str);
		   		}
		   		this.instructions += '__TEXT.__text: \n\n'+instlines.join('\n')+'\n\n';
			}
			catch(err)
			{
				alert(failmsg+"__TEXT.__text: "+err.message);
			}
		}
	};
};

MachoTool.prototype.download = function()
{
	var dlink = document.createElement('a');
	dlink.href = window.URL.createObjectURL(new Blob([mtool.macho.data], {type: 'application/octet-stream'}));
	dlink.download = this.filename+".patched";
	document.body.appendChild(dlink);	
	dlink.click();
	document.body.removeChild(dlink);
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

