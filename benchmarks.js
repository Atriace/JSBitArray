var classList = [
	"BitArray",
	"BitArray8",
	"BitArray16",
	"BitArray32",
	"BitArray64"
];

function loadClass() {
	import(`./${classList[0]}.js`).then(module => {
		registerClass(classList[0], module);
	});
}

function registerClass(className, moduleRef) {
	Object.defineProperty(window, className, {
		configurable: false,
		enumerable: false,
		writable: false,
		value: moduleRef.default
	});

	console.log("Loaded: " + className);
	classList.shift();

	if (classList.length > 0) {
		setTimeout(loadClass);
	} else {
		delete classList
		console.log("All Classes loaded.  Running benchmarks...")		
		benchmark();
	}
}

function generateHTML(info, validation, benchmarks) {
	let pre  = `<benchmark><h2>${info.name}</h2><validation><h3>Validation:</h3>`;
	let sep = ":";
	let validations = [];
	for (let name in validation) {
		validations.push(`<div>${name}${sep.padEnd(6-name.length, " ")}${validation[name][0]}${"".padEnd(9-validation[name][0].length, " ")}${validation[name][0] == validation[name][1] ? "<pass>PASSED</pass>" : "<fail>FAILED</fail>"}</div>`);
	}

	let max = 0;
	for (let test of benchmarks) {
		max = Math.max(max, test.total);
	}

	let tests = [`</validation><benchmarks><h3>Array Size:${info.size}, Iterations:${info.iterations}</h3>`];
	for (let i = 0; i < benchmarks.length; i++) {
		let test = benchmarks[i];
		tests.push(`<test>
			<bar><fill class="c${i}" style="height:${test.total/max*100}%"></fill></bar>
			<label>${test.name}</label>
			<time>${getTime(test.total/info.iterations)}</time>
		</test>`);
	}
	let post = `</benchmarks></benchmark>`
	return `${pre}${validations.join('')}${tests.join('')}${post}`;
}

function benchmark() {
	let a = new BitArray(4, 8);
	let b = new BitArray(4, 8);
	let c = new BitArray(7);

	let aState = false;
	let bState = true;
	let cState = false;
	let aInterval = Math.floor(a.length/2);
	let bInterval = 1;
	for (let i = 0; i < c.length; i++) {
		if (i % aInterval == 0) { aState = !aState; }
		if (aState) { a.set(i); }

		if (i == 1 || i == 3) { bState = !bState; }
		if (bState) { b.set(i); }

		if (i % 1 == 0) { cState = !cState; }
		if (cState) { c.set(i); }
	}

	let validation = {
		a: [a, "1100"],
		b: [b, "1001"],
		c: [c, "1010101"],
		and: [a.and(b, true), "1000"],
		or:  [a.or(b, true), "1101"],
		xor: [a.xor(b, true), "0101"],
		not: [a.not(true), "0011"],
		"a|c": [a.or(c, true), "1110"],
		"c|a": [c.or(a, true), "1110101"]
	};

	
	
	let modes = [32, 8, 16, 32];
	let len = 1024*4;
	let lastArr = null;
	let cycles = 1000;
	for (let size of modes) {
		let benchmarks = [];
		let bitArr = new BitArray(len, size);
		let copyArr = bitArr.clone();
		let state = true;

		let start = now();
		for (let cycle = 0; cycle < cycles; cycle++) {
			for (let i = 0; i < len; i++) {
				if (i % size == 0) {
					state != state;
				}

				if (state) {
					bitArr.set(i, state);
				}
				
			}
		}
		let end   = now();
		if (lastArr != null) {
			benchmarks.push({
				name: bitArr.byteSize + ".set()",
				total: end - start
			});
		}

		let ops = ["and", "or", "xor", "not"];
		if (lastArr != null) {
			for (let op of ops) {
				start = now();
				for (let cycle = 0; cycle < cycles; cycle++) {
					bitArr[op](lastArr);
				}
				end = now();
				benchmarks.push({
					name: bitArr.byteSize + "." + op,
					total:end - start
				})
			}

			document.body.innerHTML += generateHTML({name:"Dynamic: " + size, size:len, iterations:cycles}, validation, benchmarks);
		}
		lastArr = copyArr;
	}

	



	

	// console.log(`b: ${b}`);
	// console.log(`c: ${c}`);
	// console.log(`and: ${c.and(b, true)}`);
	// console.log(`an2: ${b.and(c, true)}`);

	// for (let i = 0; i < b.length; i++) {
	// 	console.log(oAnd.at(i));
	// }


	// Benchamarks
	/*let modes = [32, 8, 16, 32];
	let len = 10240;
	let lastArr = null;
	let cycles = 10;
	for (let size of modes) {
		let bitArr = new BitArray(len, size);
		let copyArr = bitArr.clone();
		let state = true;

		let start = now();
		for (let cycle = 0; cycle < cycles; cycle++) {
			for (let i = 0; i < len; i++) {
				if (i % size == 0) {
					state != state;
				}

				if (state) {
					bitArr.set(i, state);
				}
				
			}
		}
		let end   = now();
		if (lastArr != null) {
			console.log(`${bitArr.byteSize} Assign: ${getTime(end - start)}`);
		}


		if (lastArr != null) {
			start = now();
			for (let cycle = 0; cycle < cycles; cycle++) {
				bitArr.and(lastArr);
				bitArr.or(lastArr);
				bitArr.xor(lastArr);
				bitArr.not();
			}
			end   = now();
			console.log(`${bitArr.byteSize} Ops: ${getTime(end - start)}`);
		}
		lastArr = copyArr;
	}*/
}

function now() {
	return new Date().getTime()
}

function getTime(mil) {
	/* Converts Milliseconds into human readable time */
	let msg;
	const ms = mil % 1000;
	if (ms > 1) {
		msg = (ms % 1000) + "ms";
		const seconds = Math.floor(mil / 1000);
		if (seconds > 0) {
			msg = (seconds % 60) + " Seconds, " + msg;
			const minutes = Math.floor(seconds / 60);
			if (minutes > 0) {
				msg = (minutes % 60) + " Minutes, " + msg;
				const hours = Math.floor(minutes / 60);
				if (hours > 0) {
					msg = (hours % 24) + " Hours, " + msg;
				}
			}
		}
	} else {
		const us = mil * 1000;
		msg = us + "µs";
	}

	return msg;
}

loadClass();