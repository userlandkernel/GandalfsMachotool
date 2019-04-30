!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).lzjs=t()}}(function(){return function(){return function t(e,r,n){function i(a,h){if(!r[a]){if(!e[a]){var o="function"==typeof require&&require;if(!h&&o)return o(a,!0);if(s)return s(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var c=r[a]={exports:{}};e[a][0].call(c.exports,function(t){return i(e[a][1][t]||t)},c,c.exports,t,e,r,n)}return r[a].exports}for(var s="function"==typeof require&&require,a=0;a<n.length;a++)i(n[a]);return i}}()({1:[function(t,e,r){var n,i;n=this,i=function(){"use strict";var t=String.fromCharCode,e=Object.prototype.hasOwnProperty,r="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array,n=!1,i=!1;try{"a"===t.apply(null,[97])&&(n=!0)}catch(t){}if(r)try{"a"===t.apply(null,new Uint8Array([97]))&&(i=!0)}catch(t){}var s=65533,a=null,h=!1;-1!=="abcã»ã’".lastIndexOf("ã»ã’",1)&&(h=!0);var o=function(){for(var r="",n={8:1,10:1,11:1,12:1,13:1,92:1},i=0;i<127;i++)e.call(n,i)||(r+=t(i));return r}(),l=o.length,c=Math.max(l,62)-Math.min(l,62),u=l-1,f=1024,_=s,d=_-l,p=s,g=p+2*f,y=l+1,A=c+20,m=l+5,b=l-c-19;function v(t){this._init(t)}function C(t){this._init(t)}function w(t){this._init(t)}function k(t){this._init(t)}function x(){var t,e,r,n="abcdefghijklmnopqrstuvwxyz",i="",s=n.length;for(t=0;t<s;t++)for(r=n.charAt(t),e=s-1;e>15&&i.length<f;e--)i+=" "+r+" "+n.charAt(e);for(;i.length<f;)i=" "+i;return i=i.slice(0,f)}function B(e,r){if(null==r?r=e.length:e=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)}(e,r),n&&i&&r<s){if(a)return t.apply(null,e);if(null===a)try{var h=t.apply(null,e);return r>s&&(a=!0),h}catch(t){a=!1}}return function(e){var r,n="",i=e.length,h=0;for(;h<i;){if(r=e.subarray?e.subarray(h,h+s):e.slice(h,h+s),h+=s,!a){if(null===a)try{n+=t.apply(null,r),r.length>s&&(a=!0);continue}catch(t){a=!1}return S(e)}n+=t.apply(null,r)}return n}(e)}function S(e){for(var r="",n=e.length,i=0;i<n;i++)r+=t(e[i]);return r}function D(t,e){if(!r)return new Array(e);switch(t){case 8:return new Uint8Array(e);case 16:return new Uint16Array(e)}}function U(t){for(var e,r,n=[],i=0,s=t.length;i<s;i++)(e=t.charCodeAt(i))>=55296&&e<=56319&&i+1<s&&(r=t.charCodeAt(i+1))>=56320&&r<=57343&&(e=1024*(e-55296)+r-56320+65536,i++),e<128?n[n.length]=e:e<2048?(n[n.length]=192|e>>6&31,n[n.length]=128|63&e):e<65536?(n[n.length]=224|e>>12&15,n[n.length]=128|e>>6&63,n[n.length]=128|63&e):e<2097152&&(n[n.length]=240|e>>18&15,n[n.length]=128|e>>12&63,n[n.length]=128|e>>6&63,n[n.length]=128|63&e);return B(n)}function E(t){for(var e,r,n,i=[],s=0,a=t.length;s<a;)(e=(r=t.charCodeAt(s++))>>4)>=0&&e<=7?n=r:12===e||13===e?n=(31&r)<<6|63&t.charCodeAt(s++):14===e?n=(15&r)<<12|(63&t.charCodeAt(s++))<<6|63&t.charCodeAt(s++):15===e&&(n=(7&r)<<18|(63&t.charCodeAt(s++))<<12|(63&t.charCodeAt(s++))<<6|63&t.charCodeAt(s++)),n<=65535?i[i.length]=n:(n-=65536,i[i.length]=55296+(n>>10),i[i.length]=n%1024+56320);return B(i)}function N(t,e){for(var r,n,i=0,s=0,a=t.length;s<a;s++)55296==(64512&(r=t.charCodeAt(s)))&&s+1<a&&56320==(64512&(n=t.charCodeAt(s+1)))&&(r=65536+(r-55296<<10)+(n-56320),s++),r<128?i++:i+=r<2048?2:r<65536?3:4;return i}v.prototype={_init:function(t){t=t||{},this._data=null,this._table=null,this._result=null,this._onDataCallback=t.onData,this._onEndCallback=t.onEnd,this._maxBytes=t.maxBytes},_createTable:function(){for(var t=D(8,l),e=0;e<l;e++)t[e]=o.charCodeAt(e);return t},_onData:function(t,e){var r=B(t,e);this._onDataCallback?this._onDataCallback(r):this._result+=r},_onEnd:function(){this._onEndCallback&&this._onEndCallback(),this._data=this._table=null},_search:function(){var t=2,e=this._data,r=this._offset,n=u;if(this._dataLen-r<n&&(n=this._dataLen-r),t>n)return!1;var i,s,a,o,l,c=r-304,f=e.substring(c,r+n),_=r+t-3-c;do{if(2===t){if(s=e.charAt(r)+e.charAt(r+1),!~(a=f.indexOf(s))||a>_)break}else 3===t?s+=e.charAt(r+2):s=e.substr(r,t);if(!~(o=h?e.substring(c,r+t-1).lastIndexOf(s):f.lastIndexOf(s,_)))break;l=o,i=c+o;do{if(e.charCodeAt(r+t)!==e.charCodeAt(i+t))break}while(++t<n);if(a===o){t++;break}}while(++t<n);return 2!==t&&(this._index=304-l,this._length=t-1,!0)},compress:function(t){if(null==t||0===t.length)return"";var e,r=this._createTable(),n=x(),i=D(8,_),s=0,a=0;this._result="",this._offset=n.length,this._data=n+t,this._dataLen=this._data.length,n=t=null;for(var h,o,c,f,p,g=-1,b=-1;this._offset<this._dataLen;){if(this._search()?(this._index<u?(o=this._index,c=0):(o=this._index%u,c=(this._index-o)/u),2===this._length?(i[s++]=r[c+54],i[s++]=r[o],a+=2):(i[s++]=r[c+49],i[s++]=r[o],i[s++]=r[this._length],a+=3),this._offset+=this._length,~b&&(b=-1)):(h=this._data.charCodeAt(this._offset++))<132?(h<40?(o=h,c=0,g=y):g=(c=(h-(o=h%40))/40)+y,b===g?(i[s++]=r[o],a++):(i[s++]=r[g-A],i[s++]=r[o],a+=2,b=g)):(h<1640?(o=h,c=0,g=m):g=(c=(h-(o=h%1640))/1640)+m,o<40?(f=o,p=0):p=(o-(f=o%40))/40,b===g?(i[s++]=r[f],i[s++]=r[p],a+=2):(i[s++]=r[48],i[s++]=r[g-l],i[s++]=r[f],i[s++]=r[p],a+=4,b=g)),a>this._maxBytes)return!1;s>=d&&(this._onData(i,s),s=0)}return s>0&&this._onData(i,s),this._onEnd(),e=this._result,this._result=null,null===e?"":e}},C.prototype={_init:function(t){t=t||{},this._result=null,this._onDataCallback=t.onData,this._onEndCallback=t.onEnd},_createTable:function(){for(var t={},e=0;e<l;e++)t[o.charAt(e)]=e;return t},_onData:function(t){var e;if(this._onDataCallback){if(t)e=this._result,this._result=[];else{var r=p-f;e=this._result.slice(f,f+r),this._result=this._result.slice(0,f).concat(this._result.slice(f+r))}e.length>0&&this._onDataCallback(B(e))}},_onEnd:function(){this._onEndCallback&&this._onEndCallback()},decompress:function(t){if(null==t||0===t.length)return"";this._result=function(t){for(var e=[],r=t&&t.length,n=0;n<r;n++)e[n]=t.charCodeAt(n);return e}(x());for(var e,r,n,i,s,a,h,o,l,c,_=this._createTable(),d=!1,p=null,y=t.length,A=0;A<y;A++)if(void 0!==(n=_[t.charAt(A)])){if(n<b)s=d?40*_[t.charAt(++A)]+n+1640*p:40*p+n,this._result[this._result.length]=s;else if(n<47)p=n-b,d=!1;else if(48===n)p=(i=_[t.charAt(++A)])-5,d=!0;else if(n<59){if(i=_[t.charAt(++A)],n<54?(a=(n-49)*u+i,h=_[t.charAt(++A)]):(a=(n-54)*u+i,h=2),(o=this._result.slice(-a)).length>h&&(o.length=h),l=o.length,o.length>0)for(c=0;c<h;)for(r=0;r<l&&(this._result[this._result.length]=o[r],!(++c>=h));r++);p=null}this._result.length>=g&&this._onData()}return this._result=this._result.slice(f),this._onData(!0),this._onEnd(),e=B(this._result),this._result=null,e}},w.prototype={_init:function(t){t=t||{},this._codeStart=t.codeStart||255,this._codeMax=t.codeMax||65535,this._maxBytes=t.maxBytes},compress:function(r){if(null==r||0===r.length)return"";var n,i,s,a,h="",o=0,l=0,c=r.length,u="",f=this._codeStart+1,_=this._codeMax,d=2,p=[],g=0;for(c>0&&(u=n=r.charAt(l++));l<c;)if(s=1<<(a=(i=u+(n=r.charAt(l++))).length),(a<32&&g&s||a>=32&&void 0!==p[a])&&e.call(p[a],i))u+=n;else{if(1===u.length?(h+=u,o++):(h+=p[u.length][u],o+=d),o>this._maxBytes)return!1;f<=_&&(s=1<<(a=(i=u+n).length),(a<32&&!(g&s)||a>=32&&void 0===p[a])&&(p[a]={},g|=s),p[a][i]=t(f++),2048===f&&(d=3)),u=n}return 1===u.length?(h+=u,o++):(h+=p[u.length][u],o+=d),!(o>this._maxBytes)&&h},decompress:function(r){if(null==r||0===r.length)return"";var n,i,s,a,h="",o={},l=this._codeStart+1,c=this._codeStart,u=0,f=r.length;for(f>0&&(n=r.charCodeAt(u++),h+=i=t(n),s=i);u<f;)h+=a=(n=r.charCodeAt(u++))<=c?t(n):e.call(o,n)?o[n]:s+i,i=a.charAt(0),o[l++]=s+i,s=a;return h}},k.prototype={_init:function(t){t=t||{},this._encoding=t.encoding||"utf-8"},compress:function(t){if(null==t||0===t.length)return"";var e,r="",n=N(t=""+t),i=.9*n|0,s=t.length,a={maxBytes:n};return n===s?(e="W",a.codeStart=127,a.codeMax=2047,!1===(r=new w(a).compress(t))&&(e="S",!1===(r=new v(a).compress(t))&&(e="N",r=t))):n>s&&i<s?(e="U",!1===(r=new w(a).compress(U(t)))&&(e="S",!1===(r=new v(a).compress(t))&&(e="N",r=t))):(e="S",!1===(r=new v(a).compress(t))&&(e="U",(!1===(r=new w(a).compress(U(t)))||N(r)>n)&&(e="N",r=t))),e+r},decompress:function(t){if(null==t||0===t.length)return"";switch((t=""+t).charAt(0)){case"S":return this._decompressByS(t.substring(1));case"W":return this._decompressByW(t.substring(1));case"U":return this._decompressByU(t.substring(1));case"N":return this._decompressByN(t.substring(1));default:return t}},_decompressByS:function(t){return(new C).decompress(t)},_decompressByW:function(t){return new w({codeStart:127,codeMax:2047}).decompress(t)},_decompressByU:function(t){return E((new w).decompress(t))},_decompressByN:function(t){return t}};var O="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",j=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1];return{compress:function(t,e){return new k(e).compress(t)},decompress:function(t,e){return new k(e).decompress(t)},compressToBase64:function(t,e){return function(t){var e,r,n,i,s,a;for(n=t.length,r=0,e="";r<n;){if(i=255&t.charCodeAt(r++),r===n){e+=O.charAt(i>>2)+O.charAt((3&i)<<4)+"==";break}if(s=t.charCodeAt(r++),r===n){e+=O.charAt(i>>2)+O.charAt((3&i)<<4|(240&s)>>4)+O.charAt((15&s)<<2)+"=";break}a=t.charCodeAt(r++),e+=O.charAt(i>>2)+O.charAt((3&i)<<4|(240&s)>>4)+O.charAt((15&s)<<2|(192&a)>>6)+O.charAt(63&a)}return e}(U(new k(e).compress(t)))},decompressFromBase64:function(e,r){return new k(r).decompress(E(function(e){var r,n,i,s,a,h,o;for(h=e.length,a=0,o="";a<h;){do{r=j[255&e.charCodeAt(a++)]}while(a<h&&-1===r);if(-1===r)break;do{n=j[255&e.charCodeAt(a++)]}while(a<h&&-1===n);if(-1===n)break;o+=t(r<<2|(48&n)>>4);do{if(61==(i=255&e.charCodeAt(a++)))return o;i=j[i]}while(a<h&&-1===i);if(-1===i)break;o+=t((15&n)<<4|(60&i)>>2);do{if(61==(s=255&e.charCodeAt(a++)))return o;s=j[s]}while(a<h&&-1===s);if(-1===s)break;o+=t((3&i)<<6|s)}return o}(e)))}}},void 0!==r?void 0!==e&&e.exports?e.exports=i():r.lzjs=i():n.lzjs=i()},{}]},{},[1])(1)});
/*
 * @class LZSSDec
 * @param {Number} ringbuffer_size must be a power of two.
 * @param {Number} upper_limit
 * @param {Number} threshold
 * @description: Class for decompressing files encoded with limpelziv seventyseven algorithm
*/
var LZSSDec = function LZSSDec(ringbuffer_size = 4096, upper_limit = 18, threshold = 2)
{
	
};

/*
 * @class LZSSStream
 * @param {arraybuffer} data
 * @description: Stream for reading bytes chronologically from an arraybuffer
*/
var LZSSStream = function LZSSStream(data)
{
	this.ptr = 0;
	this.data = data;
};

/*
 * @method next
 * @param {uint8_t, nullable} v
 * @description: Retrieves the value or updates the buffer at the current position in the stream.
*/
LZSSStream.prototype.next = function(v)
{
	if(v){
		new uint8_t(this.data)[this.ptr++] = v;
	} else {
		return new uint8_t(this.data)[this.ptr++];
	}
};

/*
 * @method reset
 * @description: Sets the position in the buffer back to the start of the buffer.
*/
LZSSStream.prototype.reset = function()
{
	this.ptr = 0;
};

/*
 * @method decompress_lzss
 * @param {LZSSStream, nonnull} dst (destinarion stream to store the decompressed data)
 * @param {LZSSStream, nonnull} src (source stream to read compressed data from)
 * @param {uint32_t, nullable} srclen (number of bytes to decompress)
 * @param {HTMLElement, nonnull} statusELl (element to update progress of the decompression on)
 * @param {functionpointer, nonnull} callback (method to call with destination stream when decompression has finished)
 * @description: Decompresses limpelziv encoded data
*/
LZSSDec.prototype.decompress_lzss = function(dst = new LZSSStream(), src = new LZSSStream(), srclen = 0, statusEl = null, callback = function(){})
{
	this.N = 4096;
	this.F = 18;
	this.THRESHOLD = 2;
	this.NIL = this.N;

	this.THREAD_COUNT = 12;
	
	var text_buf = new uint8_t(this.N + this.F - 1);
	var dststart = 0;
	var srcend = srclen;
	var i = 0, j = 0, k = 0, r = 0, c = 0;
	var flags = 0;

	for(i = 0; i < this.N - this.F; i++) {
		text_buf[i] = ''.charCodeAt(0); // Initialize the bufer
	}

	r = this.N - this.F;

	flags = 0;
	
	// Initialize the status counter
	window.lzss_busy = true;
	window.lzss_status_last = 0;
	statusEl.innerText=(window.lzss_status_last+'% decompressed');

	// Start the asynchronous 'thread' to decompress the file
	window.lzss_stuff=[];
	for(threads = 0; threads < this.THREAD_COUNT; threads++){
		window.lzss_stuff.push(
			setInterval(
				function(callback){
					// Update the status
					window.lzss_status = ((src.ptr / srcend) * 100).toFixed(2); // quota devided by total on a scale of 0-100 gives the percent complete

					if(window.lzss_status != window.lzss_status_last && statusEl){ // No need to update if the status has not changed
						statusEl.innerText=(window.lzss_status+'% decompressed');
						window.lzss_status_last = window.lzss_status;
					}
					
					if(window.lzss_busy){
						if (((flags >>= 1) & 0x100) == 0) {
							if(src.ptr < srcend) {
								c = src.next();
							}
							else {
								window.lzss_busy = false;
								return;
							}
							flags = c | 0xFF00;
							if(flags & 1) {
								if(src.ptr < srcend) {
									c = src.next();
								} else {
									window.lzss_busy = false;
									return;
								}
								dst.next(c);
								text_buf[r++] = c;
								r &= (this.N - 1);
							}
							else {
								if(src.ptr < srcend) {
									i = src.next();
								} else {
									window.lzss_busy = false;
									return;
								}
								if(src.ptr < srcend) {
									j = src.next();
								} else {
									window.lzss_busy = false;
									return;
								}
								i |= ((j & 0xF0) << 4);
								j = (j & 0x0F) + this.THRESHOLD;
								for(k = 0; k <= j; k++) {
									c = text_buf[(i+k) & (this.N - 1)];
									dst.next(c);
									text_buf[r++] = c;
									r &= (this.N - 1);
								}
							}
						}					
					} else {
						callback(dst);
						alert('done');
						for(thread = 0; thread < window.lzss_stuff.length; thread++){
							clearInterval(window.lzss_stuff[thread]);
						}
						return;
					}
				}
			, Math.floor(Math.random()), callback)
		);
	}
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

LZSSDec.prototype.tryLZSS = function(compressed = new ArrayBuffer(), filesize = new uint32_t(new ArrayBuffer(sizeof(uint32_t))), statusEl = null, callback = function(){})
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
	if(feed == null){
		return null;
	}

	var realdata = new uint8_t(compressed).slice(feed, compressed.byteLength);

	//var rc = this.decompress_lzss(new LZSSStream(decomp), new LZSSStream(feed), _compHeader.compressedSize, statusEl, callback);
	//filesize[0] = rc;
	return realdata;
};