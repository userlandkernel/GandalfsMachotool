/*
 * DataView alternative to support iOS and Int64.
 * Improvements would be awesome if you can.
 * Written by Sem Voigtländer on April 28th, 2019.
 * Licensed under the MIT License.
*/


var float = Float64Array;
var float32 = Float32Array; 
var pointer_t = ArrayBuffer;
var int64_t = window.BigInt64Array||Float64Array;
var int32_t = Int32Array;
var int16_t = Int16Array;
var int8_t = Int8Array;
var char = int8_t;
var uint64_t = window.BigUint64Array||Float64Array;
var uint32_t = Uint32Array;
var uint16_t = Uint16Array;
var uint8_t = Uint8Array;

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

// JSMalloc lmao
var malloc = function(size) {
	if(size > UINT32_MAX) {
		return null;
	}
	return new pointer_t(size);
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

var RWView = function RWView(buffer, byteOffset, byteLength)
{
	this.buffer = buffer;
	this.byteOffset = byteOffset;
	this.byteLength = byteLength;

	if(this.constructor.toString().indexOf('Window') == 9)
	{
		throw new TypeError('RWView cannot be used as a function, it is a class.');
	}
	
	if(typeof this.buffer === 'undefined' || this.buffer == null)
	{
		this.buffer = malloc(1);
	}
	if (typeof buffer === 'number')
	{
		this.buffer = malloc(this.buffer);
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
