export default class BitArray8 extends DataView {
	constructor(sizeOrBuffer) {
		let len = 0;
		if (sizeOrBuffer instanceof ArrayBuffer) {
			len = sizeOrBuffer.byteLength * 8;
			super(sizeOrBuffer);
		} else if (Number.isInteger(sizeOrBuffer)) {
			if (sizeOrBuffer > 0x03ff000000) { throw new Error("BitArray size can not exceed 17163091968"); }
			super(new ArrayBuffer(Number((BigInt(sizeOrBuffer + 31) & ~31n) >> 3n))); // Sets ArrayBuffer.byteLength to multiples of 4 bytes (32 bits)));
      len = this.buffer.byteLength * 8;
		} else {
			throw new Error("An integer size or buffer must be provided when initalizing a BitArray");
		}
    Object.defineProperty( this
                         , "length"
                         , { configurable: false
                           , enumerable  : false
                           , writable    : false
                           , value       : len
  	                       }
                         );
	}

	get popcount(){
		let m1  = 0x55555555;
		let m2  = 0x33333333;
		let m4  = 0x0f0f0f0f;
		let h01 = 0x01010101;
		let pc  = 0;
		let x;

		for (let i = 0; i < this.buffer.byteLength; i++){
			 x = this.getUint8(i);
			 x -= (x >> 1) & m1;             //put count of each 2 bits into those 2 bits
			 x = (x & m2) + ((x >> 2) & m2); //put count of each 4 bits into those 4 bits
			 x = (x + (x >> 4)) & m4;        //put count of each 8 bits into those 8 bits
			 pc += (x * h01) >> 56;
		}
		return pc;
	}

  and(bar, inPlace = false){
  // And of this and bar. Example: 1100 & 1001 = 1000
    let len = Math.min(this.buffer.byteLength,bar.buffer.byteLength),
        res = inPlace ? this : new BitArray8(len * 8);
    for (var i = 0; i < len; i += 4) res.setUint8(i,this.getUint8(i) & bar.getUint8(i));
    return res;
  }

  any(){
  // Returns true if any of the bits in the BitArray are set. If returns false then all bits are 0
    let len = this.buffer.byteLength,
        res = true;
    for (var i = 0; res && i < len; i += 4) res = this.getUint8(i) === 0;
    return !res;
  }

  at(i){
  // Fetches the value at the given index
    return this.getUint8(i / 8) & (1 << (i & 7)) ? 1 : 0;
  }

  clear(){
  // Resets the BitArray in place
    for (let i = 0, len = this.buffer.byteLength; i < len; i += 4) this.setUint8(i,0);
  }

  every(){
  // Returns true if all bits in the BitArray are set.
    let len = this.buffer.byteLength,
        res = true;
    for (var i = 0; res && i < len; i += 4) res = this.getUint8(i) === 0xffffffff;
    return res;
  }

  fill(){
  // Sets the BitArray in place
    for (let i = 0, len = this.buffer.byteLength; i < len; i += 4) this.setUint8(i,0xffffffff);
  }

  not(inPlace = false){
  // Flips all the bits in this buffer. Example: 1100 = 0011
    let len = this.buffer.byteLength,
    res = inPlace ? this : new BitArray8(len * 8);
    for (var i = 0; i < len; i += 4) res.setUint8(i,~(this.getUint8(i) >>> 0));
    return res;
  }

  or(bar, inPlace = false){
  // Or of this and bar. Example: 1100 & 1001 = 1101
    let len = Math.min(this.buffer.byteLength,bar.buffer.byteLength),
    res = inPlace ? this : new BitArray8(len * 8);
    for (var i = 0; i < len; i += 4) res.setUint8(i,this.getUint8(i) | bar.getUint8(i));
    return res;
  }

  reset(i){
	// Resets the value at the given index.
    this.setUint8(i / 8, this.getUint8(i / 8) & ~(1 << (i & 7)));
  }

  set(i){
	// Sets the value at the given index.
    this.setUint8(i / 8, this.getUint8(i / 8) | (1 << (i & 7)));
  }

  slice(a = 0, b = this.buffer.byteLength){
  // Slices BitArray and returns a new BitArray with buffer byteLength in multiples of 4 bytes (32 bits)
  // The default argument values instantiate a clone.
    b = a + Number((BigInt(b - a + 31) & ~31n));
    return new BitArray8(this.buffer.slice(a, b));
  }

  toggle(i){
	// Flips the value at the given index
    this.setUint8(i / 8, this.getUint8(i / 8) ^ (1 << (n & 7)));
  }

  // For efficiency maps this.buffer to an Uint8Array and byte by byte reverses the rank of bits and stringifies by
  // reducing. However stringifying a huge BitArray is meaningless. Perhaps limiting the string size to 128 is reasonable.
  toString(){
    return new Uint8Array(this.buffer).reduce((p,c) => p + ((BigInt(c)* 0x0202020202n & 0x010884422010n) % 1023n).toString(2).padStart(8,"0"),"");
  }

  xor(bar, inPlace = false){
	// Xor of this and bar. Example: 1100 & 1001 = 0101;
    let len = Math.min(this.buffer.byteLength, bar.buffer.byteLength),
    res = inPlace ? this : new BitArray8(len * 8);
    for (var i = 0; i < len; i += 4) res.setUint8(i,this.getUint8(i) ^ bar.getUint8(i));
    return res;
  }

  clone() {
    // Copies the values from this BitArray into a new BitArray
    let result = new BitArray8(this.buffer.byteLength);
    for (let i = 0; i < this.buffer.byteLength/8; i++) {
      result.setUint8(i, this.getUint8(i));
    }
    return result;
  }
}