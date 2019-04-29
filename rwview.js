/*
 * DataView alternative to support iOS and Int64.
 * Improvements would be awesome if you can.
 * Written by Sem Voigtländer on April 28th, 2019.
 * Licensed under the MIT License.
*/

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
}

var RWView = function RWView(buffer, byteOffset, byteLength)
{
	this.buffer = buffer;
	this.byteOffset = byteOffset;
	this.byteLength = byteLength;
	this.view = new DataView(this.buffer);
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
	return this.view.getInt8(byteOffset, littleEndian);
};

RWView.prototype.getUint8 = function(byteOffset = 0, littleEndian = false){
	return this.view.getUint8(byteOffset, littleEndian);
};

RWView.prototype.getInt16 = function(byteOffset = 0, littleEndian = false){
	return this.view.getInt16(byteOffset, littleEndian);
};

RWView.prototype.getUint16 = function(byteOffset = 0, littleEndian = false){
	return this.view.getUint16(byteOffset, littleEndian);
};

RWView.prototype.getInt32 = function(byteOffset = 0, littleEndian = false){
	return this.view.getInt32(byteOffset, littleEndian);
};

RWView.prototype.getUint32 = function(byteOffset = 0, littleEndian = false)
{
	return this.view.getUint32(byteOffset, littleEndian);
};

RWView.prototype.getFloat32 = function(byteOffset = 0, littleEndian = false)
{
	return this.view.getFloat32(byteOffset, littleEndian);
};

RWView.prototype.getFloat64 = function(byteOffset = 0, littleEndian = false)
{
	return this.view.getFloat64(byteOffset, littleEndian);
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
	if(!(value instanceof Int64)) {
		value = new Int64(value);
	}

	var bytes = value.getBytes();
	for(i = 0; i< bytes.length; i++) {
		new Int8Array(this.buffer)[i] = bytes[i];
	}
};
