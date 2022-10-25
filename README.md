# BitArray

Written by [Redu](https://stackoverflow.com/users/4543207/redu), with contributions by [Atriace](https://stackoverflow.com/users/923972/atriace) due to the question of ["How do I create a bit array in Javascript"](https://stackoverflow.com/questions/6972717/how-do-i-create-bit-array-in-javascript/73993403#answer-73993403)

This is a Javascript class implementation of a BitArray extending [DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView).  It implements bit masks to access the bits which are technically stored as `Bytes` in the DataView.  Conveniently, it also offers [standard boolean operations](https://en.wikipedia.org/wiki/Bit_array#Basic_operations).



**Constructor:** *BitArray(sizeOrBuffer)*

`sizeOrBuffer` : Either a pre-existing [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) or a [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)

##### Syntax
```javascript
new BitArray(buffer);
new BitArray(number);
```

### Examples

Starting with something simple...
```javascript
var a = new BitMask(4);
a.set(0, true);
a.set(3, true);

console.log(a); // 1001
```

Basic proofs...
```javascript
let a = new BitArray(4);
let b = new BitArray(4);

// Populate values
let aState = false;
let bState = true;
for (let i = 0; i < a.length; i++) {
	let curVal = (i % (a.length/2));
	if (curVal == 0) {
		aState = !aState;
	}
	a.set(i, aState);

	let bVal = i % 1;
	if (bVal == 0) {
		bState = !bState;
	}
	b.set(i, bState);
}

// Let's see the starting state
console.log(`a: ${a}, length: ${a.length}, popcount:${a.popcount}`);
console.log(`b: ${b}, length: ${b.length}, popcount:${b.popcount}`);

/* LOG
    a: 1100, length: 4, popcount:2
    b: 0101, length: 4, popcount:2
*/
```

**Operators**
```javascript
let oAnd = b.and(a, true);
let oOr  = b.or(a, true);
let oXor = b.xor(a, true);
let oNot = b.not(true);

console.log(`and: ${oAnd}, length: ${oAnd.length}, popcount:${oAnd.popcount}`);
console.log(`or: ${oOr}, length: ${oOr.length}, popcount:${oOr.popcount}`);
console.log(`xor: ${oXor}, length: ${oXor.length}, popcount:${oXor.popcount}`);
console.log(`not: ${oNot}, length: ${oNot.length}, popcount:${oNot.popcount}`);

/* LOG
  and: 0100, length: 4, popcount:1
  or:  1101, length: 4, popcount:3
  xor: 1001, length: 4, popcount:2
  not: 1010, length: 4, popcount:6
*/
```
