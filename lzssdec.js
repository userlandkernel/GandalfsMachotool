var LZSSDec = function LZSSDec(ringbuffer_size = 4096, upper_limit = 18, threshold = 2)
{
	this.N = ringbuffer_size;
	this.F = upper_limit;
	this.THRESHOLD = threshold;
	this.NIL = this.N;
};
var LZSSStream = function LZSSStream(data)
{
	this.ptr = 0;
	this.data = data;
};
LZSSStream.prototype.next = function(v)
{
	if(v){
		new uint8_t(this.data)[this.ptr++] = v;
	} else {
		return new uint8_t(this.data)[this.ptr++];
	}
};
LZSSStream.prototype.reset = function()
{
	this.ptr = 0;
};

LZSSDec.prototype.decompress_lzss = function(dst = new LZSSStream(), src = new LZSSStream(), srclen = 0)
{
	var text_buf = new uint8_t(this.N + this.F - 1);
	var dststart = 0;
	var srcend = srclen;
	var i = 0, j = 0, k = 0, r = 0, c = 0;
	var flags = 0;

	for(i = 0; i < this.N - this.F; i++)
		text_buf[i] = ''.charCodeAt(0);

	r = this.N - this.F;
	flags = 0;
	window.lzss_status_last = 0;
	for(;;){
		window.lzss_status = ((src.ptr / srcend) * 100).toFixed(2);
		if(window.lzss_status_last != window.lzss_status){
			console.log(window.lzss_status+'% decompressed');
			window.lzss_status_last = window.lzss_status;
		}
		if (((flags >>= 1) & 0x100) == 0) {
			if(src.ptr < srcend) {
				c = src.next();
			}
			else {
				break;
			}
			flags = c | 0xFF00;
		}
		if (flags & 1) {
			if(src.ptr < srcend) {
				c = src.next();
			} else {
				break;
			}
			if(dst.ptr == dstend)
			{
				throw "overflow in decoding";
			}
			dst.next(c);
			text_buf[r++] = c;
			r &= (this.N - 1);
		} else {
			if(src.ptr < srcend) {
				i = src.next();
			} else {
				break;
			}
			if(src.ptr < srcend) {
				j = src.next();
			} else {
				break;
			}
			i |= ((j & 0xF0) << 4);
			j = (j & 0x0F) + this.THRESHOLD;
			for(k = 0; k <= j; k++) {
				c = text_buf[(i+k) & (this.N - 1)];
				dst.next(c);
				text_buf[r++] = c;
				r &= (N - 1);
			}
		}
	}
	return Math.floor(dst.ptr - dststart);
};

var compHeader = function compHeader(data)
{
	var _view = new RWView(data);
	this.sig = new TextDecoder().decode(new Uint8Array(data).slice(0, 8));
	this.unknown = _view.getUint32(2*sizeof(uint32_t));
	this.uncompressedSize = _view.getUint32(3*sizeof(uint32_t));
	this.compressedSize = _view.getUint32(4*sizeof(uint32_t));
	this.unknown1 = _view.getUint32(5*sizeof(uint32_t));
};
compHeader.prototype.BYTES_PER_ELEMENT = sizeof(char)*8+sizeof(uint32_t)*4;

LZSSDec.tryFindCompHeader = function(data)
{
	return fseek(data, new TextEncoder().encode('complzss'), 0x1000);
};

LZSSDec.dectect = function(data)
{
	var pos = LZSSDec.tryFindCompHeader(data);
	if(pos < 0) {
		return false;
	}
	else {
		return true;
	}
};

LZSSDec.prototype.tryLZSS = function(compressed = new ArrayBuffer(), filesize = new uint32_t(new ArrayBuffer(sizeof(uint32_t))), callback = function(){})
{
	var _comppos = LZSSDec.tryFindCompHeader(compressed);
	if(_comppos < 0) {
		return null;
	}
	compressed = new Uint8Array(compressed).slice(_comppos, compressed.byteLength).buffer;
	var _compview = new RWView(compressed);
	var _compHeader = new compHeader(compressed);
	console.debug(_compHeader);
	var sig = [0xfeedfacf, 0x100000c];
	var sig2 = [0xfeedface, 0x000000c];
	var decomp = new Uint8Array(new ArrayBuffer(_compHeader.uncompressedSize));

	var feed = null;
	for(i = 64; i < 1024; i++)
	{
		if(_compview.getUint32(i, true) == sig[0] && _compview.getUint32(i+sizeof(uint32_t), true) == sig[1]) {
			feed = i;
			console.info('found 64-bit LSB mach-o magic at '+i);
			break;
		}
		else if(_compview.getUint32(i, false) == sig[0] && _compview.getUint32(i+sizeof(uint32_t), false) == sig[1]) {
			feed = i;
			console.info('found 64-bit MSB mach-o magic at '+i);
			break;
		}
		else if(_compview.getUint32(i, true) == sig2[0] && _compview.getUint32(i+sizeof(uint32_t), true) == sig2[1])
		{
			feed = i;
			console.info('found 32-bit LSB mach-o magic at '+i);
			break;
		}

		else if(_compview.getUint32(i, false) == sig2[0] && _compview.getUint32(i+sizeof(uint32_t), false) == sig2[1])
		{
			feed = i;
			console.info('found 32-bit MSB magic at '+i);
			break;
		}
	}
	if(!feed){
		return null;
	}

	feed--;
	feed = compressed.slice(feed, compressed.byteLength);

	var rc = this.decompress_lzss(new LZSSStream(decomp), new LZSSStream(feed), _compHeader.compressedSize);
	filesize[0] = rc;
	return callback(decomp);
};