/*
 * DataView alternative to support iOS and Int64.
 * Improvements would be awesome if you can.
 * Written by Sem Voigtländer on April 28th, 2019.
 * Licensed under the MIT License.
*/

// Fix webkit already defined bug?
delete float;
delete float32; 
delete pointer_t;
delete int64_t;
delete int32_t;
delete int16_t;
delete int8_t;
delete uint64_t;
delete uint32_t;
delete uint16_t;
delete uint8_t;
delete char;
delete size_t;
delete vm_size_t;

var float = Float64Array;
var float32 = Float32Array; 
var pointer_t = ArrayBuffer;
var int64_t = BigInt64Array;
var int32_t = Int32Array;
var int16_t = Int16Array;
var int8_t = Int8Array;
var uint64_t = BigUint64Array;
var uint32_t = Uint32Array;
var uint16_t = Uint16Array;
var uint8_t = Uint8Array;
var char = uint8_t;
var size_t = uint32_t;
var vm_size_t = uint32_t;
// Unsigned int boundaries, thanks to wraparound :)
var UINT64_MAX = parseInt(new uint64_t(['-1'])[0]); // BigInts are 'kindof' fake in js
var UINT64_MIN = 0;
var UINT32_MAX = new uint32_t([-1])[0]; //-1 will 'wraparound' to highest uint32
var UINT32_MIN = 0;
var UINT16_MAX = new uint16_t([-1])[0];
var UINT16_MIN = 0;
var UINT8_MAX = new uint8_t([-1])[0];
var UINT8_MIN = 0;

// Signed int boundaries
var INT64_MAX = UINT64_MAX;
var INT64_MIN = -UINT64_MAX;
var INT32_MAX = UINT32_MAX;
var INT32_MIN = -UINT32_MAX;
var INT16_MAX = UINT16_MAX;
var INT16_MIN = -UINT16_MAX;
var INT8_MAX = UINT8_MAX;
var INT8_MIN = -UINT8_MAX;

String.prototype.asArrayBuffer = function()
{
	var u8 = new Uint8Array(this.length);
	for(i = 0; i < u8.byteLength; i++){
		u8[i] = this.charCodeAt(i);
	}
	return u8.buffer;
};

Uint8Array.prototype.asString = function()
{
	var tmp = '';
	for(i = 0; i < this.byteLength; i++)
	{
		tmp+=String.fromCharCode(this[i]);
	}
	return tmp;
};

function swap16(val) {
    return ((val & 0xFF) << 8)
           | ((val >> 8) & 0xFF);
}

function swap32(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
}

// JSMalloc lmao
var malloc = function(size) {
	if(size > UINT32_MAX) {
		return null;
	}
	return new pointer_t(size);
};

var RWViewException = function RWViewException(msg=''){
	this.message = msg.toString(16);
	this.stack = (new Error()).stack;
	this.name = "RWViewException";
};

var RWView = function RWView(buffer, byteOffset, byteLength)
{

	this.buffer = buffer;
	if(!byteOffset) {
		byteOffset = 0;
	}

	if(!byteLength)
	{
		byteLength = buffer.byteLength;
	}

	this.byteOffset = byteOffset;
	this.byteLength = byteLength;

	if(this.constructor.toString().indexOf('Window') == 9)
	{
		throw new RWViewException('RWView cannot be used as a function, it is a class.');
	}

	if(typeof buffer === 'undefined' || buffer == null)
	{
		this.buffer = malloc(1);
	}

	if (typeof buffer === 'number')
	{
		this.buffer = malloc(this.buffer);
	}

	if(this.byteOffset && this.byteLength) {
		buffer = new uint8_t(buffer).slice(byteOffset, byteLength).buffer;
	}

	var _size = this.buffer.byteLength;
	var _unaligned = function(x){return (x % sizeof(uint64_t) != 0); };
	if(_unaligned(_size))
	{
		while(_unaligned(_size))
		{
			_size++;
		}
		var _tmp = new uint8_t(malloc(_size));
		_tmp.set(new uint8_t(this.buffer));
		this.buffer = _tmp.buffer;
	}

	this.view = new DataView(this.buffer);
	this.i64 = new int64_t(this.buffer);
	this.f64 = new float(this.buffer);
	this.f32 = new float32(this.buffer);
	this.i32 = new int32_t(this.buffer);
	this.i16 = new int16_t(this.buffer);
	this.i8 = new int8_t(this.buffer);
	this.u64 = new uint64_t(this.buffer);
	this.u32 = new uint32_t(this.buffer);
	this.u16 = new uint16_t(this.buffer);
	this.u8 = new uint8_t(this.buffer);

	this.ptr = 0;
	this.lsb = true;


};

RWView.prototype.setEndianess = function(lsb = true)
{
	this.lsb = lsb;
};

RWView.prototype.read = function(offset = 0, size = 0){
	if(offset < 0 || size < 0)
	{
		throw new RWViewException("OOB read");
	}

	if(offset+size > this.buf.byteLength)
	{
		throw new RWViewException("OOB read");
	}

	return new RWView(this.u8.slice(offset, offset+size).buffer);
};

RWView.prototype.toString = function()
{
	var tmp = '';
	for(i = 0; i < this.u8.byteLength; i++)
	{
		tmp+=String.fromCharCode(this.u8[i]);
	}
	return tmp;
};

RWView.prototype.writeString = function(off = 0, str = '' )
{
	var temp = new Uint8Array(str.length);
	for(i = 0; i < temp.byteLength; i++){
		temp[i] = str.charCodeAt(i);
	}
	this.u8.set(temp, off);
};

RWView.prototype.writeBuffer = function(src = new ArrayBuffer(), dst = 0)
{
	this.u8.set(new Uint8Array(src), dst);
};

RWView.prototype.getInt8 = function(off = 0)
{
	return this.view.getInt8(off, this.lsb);
};

RWView.prototype.getInt16 = function(off = 0)
{
	return this.view.getInt16(off, this.lsb);
};

RWView.prototype.getInt32 = function(off = 0)
{
	return this.view.getInt32(off, this.lsb);
};

RWView.prototype.getInt64 = function(off = 0)
{
	return new Int64(this.read(off, sizeof(uint64_t)));
};

RWView.prototype.getUint8 = function(off = 0)
{
	return this.view.getUint8(off, this.lsb);
};

RWView.prototype.getUint16 = function(off = 0)
{
	return this.view.getUint16(off, this.lsb);
};

RWView.prototype.getUint32 = function(off = 0)
{
	return this.view.getUint32(off, this.lsb);
};

RWView.prototype.getUint64 = function(off = 0)
{
	return new Int64(this.read(off, sizeof(uint64_t)));
};

RWView.prototype.getFloat32 = function(off = 0)
{
	return this.view.getFloat32(off, true);
};

RWView.prototype.getFloat64 = function(off = 0)
{
	return this.view.getFloat64(off, this.lsb);
};

var memset = function(dst = new pointer_t(), val = new uint8_t(), len = new uint32_t())
{
	new uint8_t(dst).fill(val, 0, len);
};

var memcpy = function(dst=new pointer_t(), src=new pointer_t())
{
	if(src.byteLength > dst.byteLength)
	{
		throw "Overflow. Source is bigger than the destination.";
	}
	new uint8_t(dst).set(new uint8_t(src));
};

function sizeof(JSValue='')
{
	if(JSValue.BYTES_PER_ELEMENT)
	{
		return JSValue.BYTES_PER_ELEMENT;
	}
	else if(typeof JSValue === 'string')
	{
		return string.length*sizeof(uint8_t);
	}
	else
	{
		return JSValue.length;
	}
}

function fseek(haystack = new ArrayBuffer(), pattern = new char(), maxpos = 0x1000)
{
	var _haystack = new char(haystack);
	var _pattern = new TextDecoder().decode(pattern);
	maxpos = new uint32_t([maxpos])[0];
	if(maxpos > haystack.byteLength)
	{
		maxpos = haystack.byteLength;
	}
	for(i = 0; i < maxpos; i++)
	{
		var current = new TextDecoder().decode(_haystack.slice(i, i+pattern.byteLength));
		if(current == _pattern)
		{
			return i;
		}
	}
	return -1;
};

RWView.prototype.setInt8 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setInt8(byteOffset, value, littleEndian);
};

RWView.prototype.setUint8 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setUint8(byteOffset, value, littleEndian);
};

RWView.prototype.setInt16 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setInt16(byteOffset, value, littleEndian);
};

RWView.prototype.setUint16 =function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setUint16(byteOffset, value, littleEndian);
};

RWView.prototype.setInt32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setInt32(byteOffset, value, littleEndian);
};

RWView.prototype.setUint32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setUint32(byteOffset, value, littleEndian);
};

RWView.prototype.setFloat32 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setFloat32(byteOffset, value, littleEndian);
};

RWView.prototype.setFloat64 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	return this.view.setFloat64(byteOffset, value, littleEndian);
};

RWView.prototype.setInt64 = function(byteOffset = 0, value = 0, littleEndian = false)
{
	this.writeBuffer(new Int64(value).getBytes().buffer, byteOffset);
};

var DataReader = function(data) {
	this.view = new RWView(data.buffer, 0, data.byteLength);
	this.view.setEndianess(true);
	this.data = data;
	this.pos = 0;
};

DataReader.prototype.getUint32 = function () {
	try {
		this.pos += 4;
		return this.view.getUint32(this.pos - 4, this.lsb);
	}
	catch(ex)
	{
		return 0;
	}
};

DataReader.prototype.getUint16 = function () {
	try {
		this.pos += 2;
		return this.view.getUint16(this.pos - 2, this.lsb);
	}
	catch(ex)
	{
		return 0;
	}
};

DataReader.prototype.getUint8 = function () {
	try {
		this.pos += 1;
		return this.view.getUint8(this.pos - 1, this.lsb);
	}
	catch(ex)
	{
		return 0;
	}
};

DataReader.prototype.getF64 = function () {
	try {
		this.pos += 8;
		return Int64.fromDouble(this.view.getFloat64(this.pos - 8));
	}
	catch(ex)
	{
		return Int64.fromDouble(0);	
	}
};

DataReader.prototype.getBlob = function(size) {
	this.pos += size;
	var result = this.data.slice(this.pos - size, this.pos);
	return result;
};

DataReader.prototype.getBlobAtOffset = function(offset, size) {

	var result = this.data.slice(offset, offset + size);
	return result;
};

DataReader.prototype.atU8 = function(pos=0) {
	return this.view.getUint8(this.pos + pos);
};

DataReader.prototype.reset = function(pos) {
	this.pos = pos;
};

function lshiftU32Array(u32arr, shift) {

	u32arr[0] = u32arr[0] << shift;

	let extra = u32arr[1] & (0xffffffff << (32-shift));
	extra = extra >> (32 - shift);

	u32arr[0] = u32arr[0] & extra;
	u32arr[1] = u32arr[1] << shift;
}

DataReader.prototype.F64uleb128 = function () {

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
};

DataReader.prototype.U32uleb128 = function () {

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
};

DataReader.prototype.bytesLeft = function () {
	return this.data.length - this.pos;
};

// read a null-terminated string
DataReader.prototype.getStr = function() {

	let end = this.data.indexOf(0, this.pos);

	let arr = Array.from(this.data.slice(this.pos, end));
	this.pos = end+1;

	return String.fromCharCode(...arr);
};

DataReader.prototype.getStrAt = function(pos) {

	let end = this.data.indexOf(0, pos);

	let arr = Array.from(this.data.slice(pos, end));
	return String.fromCharCode(...arr);
};

DataReader.prototype.skip = function(len) {
	this.pos += len;
};

DataReader.prototype.move = function (pos) {
	this.pos = pos;
};

DataReader.prototype.writeString = function(off = 0, str = '' )
{
	var temp = new TextEncoder().encode(str);
	this.data.set(temp, off);
};

function lastbit(n)
{
	return parseInt('0x'+n.toString(16)[n.toString(16).length-1]);
}
