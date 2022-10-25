export default class BitArray extends DataView {
	#getter;
	#setter;
	#bytesPerIndex;
	#shiftAmount;

	// n >> 3 is Math.floor(n/8)
	// n & 7 is n % 8

	constructor(sizeOrBuffer, byteSize = 8) {
		let len = 0;
		let validValues = [8, 16, 32, 64];
		if (validValues.indexOf(byteSize) == -1) {
			throw new Error("Mode must be one of: " + validValues);
		}

		if (sizeOrBuffer instanceof ArrayBuffer) {
			len = sizeOrBuffer.byteLength * byteSize;
			super(sizeOrBuffer);
		} else if (Number.isInteger(sizeOrBuffer)) {
			if (sizeOrBuffer > 1.5e10) { throw new Error("BitArray size can not exceed 1.5e10"); }
			len = sizeOrBuffer;
			super(new ArrayBuffer(Math.ceil(len / byteSize) * byteSize)); // Must be multiples of the byteSize
		} else {
			throw new Error("A size or buffer must be provided when initalizing a BitArray");
		}

		this.#getter = byteSize != 64 ? this["getUint" + byteSize] : this.getBigUint64;
		this.#setter = byteSize != 64 ? this["setUint" + byteSize] : this.setBigUint64;
		this.#shiftAmount = validValues.indexOf(byteSize) + 3;
		this.#bytesPerIndex = byteSize/8;

		Object.defineProperty(this, "byteSize", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: byteSize
		});

		Object.defineProperty(this, "indexes", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: Math.ceil(len / byteSize)
		});

		Object.defineProperty(this, "length", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: len
		});
	}

	get popcount(){
		let m1  = 0x55555555;
		let m2  = 0x33333333;
		let m4  = 0x0f0f0f0f;
		let h01 = 0x01010101;
		let pc  = 0;
		let x;

		for (let i = 0; i < this.buffer.byteLength; i++){
			x   = this.getIndex(i);
			x  -= (x >> 1) & m1;              //put count of each 2 bits into those 2 bits
			x   = (x & m2) + ((x >> 2) & m2); //put count of each 4 bits into those 4 bits
			x   = (x + (x >> 4)) & m4;        //put count of each 8 bits into those 8 bits
			pc += (x * h01) >> 56;
		}
		return pc;
	}

	getIndex(i) {
		let offset = i >> this.#shiftAmount * this.#bytesPerIndex;
		return this.#getter(offset);
	}

	setIndex(i, v) {
		let offset = i >> this.#shiftAmount * this.#bytesPerIndex;
		this.#setter(offset, v);
	}

	at(i) {
		// Fetches the value at the given index
		if (i >= 0 && i < this.length) {
			return this.getIndex(i) & (1 << (i & 7)) ? 1 : 0;
		}
		return 0;
	}

	set(i, bool = true) {
		// Sets the value at the given index to the provided boolean
		if (i >= 0 && i < this.length) {
			this.setIndex(i, this.getIndex(i) | (bool << (i & 7)));
		}
	}

	reset(i) {
		// Sets the value at the given index to 0
		if (i >= 0 && i < this.length) {
			this.setIndex(i, this.getIndex(i) & ~(1 << (i & 7)));
		}
	}

	fill() {
		// Fills the array with 1s
		let max = {
			"8":255,
			"16":65535,
			"32":4294967295,
			"64":18446744073709551615
		};
		for (let i = 0; i < this.length; i++) {
			this.setIndex(i , max[this.byteSize]);
		}
	}

	clear(){
		// Fills the array with 0s
		for (let i = 0; i < this.length; i++) {
			this.setIndex(i, 0);
		}
	}

	toggle(i) {
		// Flips the value at the given index
		if (i >= 0 && i < this.length) {
			this.setIndex(i, this.getIndex(i) ^ (1 << (i & 7)));
		}
	}

	slice(a = 0, b = this.length) {
		return new BitArray(b - a, this.buffer.slice(a >> this.#shiftAmount, b >> this.#shiftAmount));
	}

	toString() {
		let msg = [];
		for (let i = 0; i < this.length; i++) {
			msg.push(this.at(i));
		}
		return msg.join('');
	}

	and(bar, newArray = false) {
		// And of this and bar.  Example: 1100 & 1001 = 1000
		let result = newArray ? new BitArray(this.length, this.byteSize) : this;
		for (let i = 0; i < this.length; i++) {
			if (i < bar.length) {
				result.setIndex(i, this.getIndex(i) & bar.getIndex(i));
			} else {
				result.setIndex(i, 0);
			}
			
		}
		return result;
	}
	
	or(bar, newArray = false) {
		// Or of this and bar.  Example: 1100 | 1001 = 1101
		let result = newArray ? new BitArray(this.length, this.byteSize) : this;
		for (let i = 0; i < this.length; i++) {
			if (i < bar.length) {
				result.setIndex(i, this.getIndex(i) | bar.getIndex(i));
			} else {
				result.setIndex(i, this.getIndex(i));
			}
		}
		return result;
	}

	xor(bar, newArray = false) {
		// Xor of this and bar.  Example: 1100 ^ 1001 = 0101;
		let result = newArray ? new BitArray(this.length, this.byteSize) : this;
		for (let i = 0; i < result.length; i++) {
			if (i < bar.length) {
				result.setIndex(i, this.getIndex(i) ^ bar.getIndex(i));
			} else {
				result.setIndex(i, this.getIndex(i));
			}
		}
		return result;
	}
	
	not(newArray = false) {
		// Flips all the bits in this buffer.  Example: 1100 = 0011
		let result = newArray ? new BitArray(this.length, this.byteSize) : this;
		for (let i = 0; i < this.length; i++) {
			result.setIndex(i, ~(this.getIndex(i) >> 0));
		}
		return result;
	}

	clone() {
		// Copies the values from this BitArray into a new BitArray
		let result = new BitArray(this.length, this.byteSize);
		for (let i = 0; i < this.indexes; i++) {
			result.setIndex(i, this.getIndex(i));
		}
		return result;
	}
}