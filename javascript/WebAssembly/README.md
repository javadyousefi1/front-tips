# WebAssembly Performance Comparison

A practical demonstration comparing JavaScript vs WebAssembly performance for computational tasks.

## Table of Contents

- [What is WebAssembly?](#what-is-webassembly)
- [Why Use WebAssembly?](#why-use-webassembly)
- [How WebAssembly Works](#how-webassembly-works)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Understanding the Code](#understanding-the-code)
- [Performance Analysis](#performance-analysis)
- [WebAssembly Fundamentals](#webassembly-fundamentals)
- [Common Use Cases](#common-use-cases)
- [Limitations](#limitations)
- [Further Learning](#further-learning)

---

## What is WebAssembly?

**WebAssembly (WASM)** is a binary instruction format designed as a portable compilation target for high-level languages like C, C++, Rust, and others. It runs in modern web browsers alongside JavaScript.

### Key Characteristics:

- **Binary Format**: Compact, fast to decode
- **Stack-Based Virtual Machine**: Uses a stack for operations
- **Near-Native Performance**: Much faster than interpreted JavaScript for compute-intensive tasks
- **Language Agnostic**: Can be compiled from many languages
- **Secure**: Runs in a sandboxed environment
- **Web Standard**: Supported by all major browsers (Chrome, Firefox, Safari, Edge)

---

## Why Use WebAssembly?

### Advantages:

1. **Performance**:
   - Executes at near-native speed (within 1-2x of native code)
   - Faster than JavaScript for CPU-intensive computations
   - Predictable performance (no JIT compilation overhead)

2. **Portability**:
   - Write once in C/C++/Rust, run anywhere
   - Reuse existing codebases on the web

3. **Efficiency**:
   - Smaller binary size compared to equivalent JavaScript
   - Faster parsing and compilation

4. **Type Safety**:
   - Statically typed at compile time
   - Memory-safe execution

### When to Use WebAssembly:

- Heavy mathematical computations (physics simulations, cryptography)
- Image/video/audio processing
- Game engines
- CAD applications
- Machine learning inference
- Compression/decompression algorithms
- Port existing C/C++/Rust libraries to web

---

## How WebAssembly Works

```
┌─────────────┐
│   C/Rust    │  Source Code (high-level language)
└──────┬──────┘
       │
       ▼ Compile
┌─────────────┐
│  .wasm file │  Binary format (portable bytecode)
└──────┬──────┘
       │
       ▼ Load in Browser
┌─────────────┐
│  JavaScript │  ──► Fetch & Instantiate WASM
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Browser   │  Execute in sandboxed environment
└─────────────┘
```

### Execution Flow:

1. **Compile**: Source code → `.wasm` binary
2. **Fetch**: JavaScript fetches the `.wasm` file
3. **Instantiate**: Browser validates and compiles to machine code
4. **Execute**: JavaScript calls exported WASM functions
5. **Return**: WASM returns results to JavaScript

---

## Project Structure

```
WebAssembly/
├── index.html      # Main HTML file (UI structure)
├── styles.css      # Styling for the demo
├── index.js        # JavaScript logic (fetch WASM, run tests)
├── sum.wat         # WebAssembly text format (human-readable)
├── sum.wasm        # Compiled WebAssembly binary
└── README.md       # This file
```

### File Descriptions:

- **index.html**: Entry point with UI elements
- **styles.css**: Visual styling for results display
- **index.js**: Implements both JS and WASM performance tests
- **sum.wat**: Source code in WebAssembly Text format
- **sum.wasm**: Binary compiled from `sum.wat`

---

## How to Run

### Prerequisites:

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server) or any HTTP server

### Steps:

1. **Navigate to the directory**:
   ```bash
   cd javascript/WebAssembly
   ```

2. **Start a local server**:
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # OR using Node.js
   npx http-server -p 8000

   # OR using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

4. **Click "Run Performance Test"** to see the comparison

### Why a Server?

WebAssembly files must be served via HTTP/HTTPS due to CORS and security policies. Opening `index.html` directly (`file://`) will fail with a fetch error.

---

## Understanding the Code

### 1. JavaScript Version (`index.js`)

```javascript
function sumUptoJS(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
```

**How it works**:
- Simple loop from 1 to n
- Adds each number to `sum`
- JavaScript engine interprets and optimizes (JIT)

### 2. WebAssembly Version (`sum.wat`)

```wasm
(module
  (func $sum_upto (param $n i32) (result i32)
    (local $i i32)
    (local $sum i32)

    ;; Loop and accumulate sum
    ...
  )
  (export "sum_upto" (func $sum_upto))
)
```

**How it works**:
- Compiled to binary format (`.wasm`)
- Executed directly by browser's WASM engine
- No interpretation overhead

### 3. Loading WASM in JavaScript

```javascript
// Fetch the binary file
const bytes = await fetch("sum.wasm").then(r => r.arrayBuffer());

// Instantiate the WASM module
const { instance } = await WebAssembly.instantiate(bytes);

// Call exported function
const result = instance.exports.sum_upto(100_000_000);
```

**Step-by-step**:
1. `fetch()` - Downloads `.wasm` file
2. `.arrayBuffer()` - Converts to raw bytes
3. `WebAssembly.instantiate()` - Compiles and creates instance
4. `instance.exports` - Access exported functions

---

## Performance Analysis

### Expected Results:

For summing 1 to 100,000,000:

| Implementation | Typical Time | Speed |
|---------------|--------------|-------|
| JavaScript    | ~200-500ms   | Baseline |
| WebAssembly   | ~50-150ms    | 2-5x faster |

### Why WASM is Faster:

1. **No Type Coercion**:
   - JS must check types at runtime
   - WASM uses static typing (i32)

2. **Direct Compilation**:
   - WASM compiles directly to machine code
   - No JIT warmup needed

3. **Optimized Instructions**:
   - WASM uses efficient bytecode
   - Closer to CPU instructions

4. **Memory Efficiency**:
   - Predictable memory layout
   - No garbage collection overhead

### Factors Affecting Performance:

- Browser engine (V8, SpiderMonkey, JavaScriptCore)
- CPU architecture
- System load
- Optimization levels

---

## WebAssembly Fundamentals

### Data Types:

WebAssembly has only 4 basic types:

| Type | Description | Size |
|------|-------------|------|
| `i32` | 32-bit integer | 4 bytes |
| `i64` | 64-bit integer | 8 bytes |
| `f32` | 32-bit float | 4 bytes |
| `f64` | 64-bit float | 8 bytes |

### Memory Model:

- **Linear Memory**: Contiguous array of bytes
- **Shared with JS**: Can read/write from both sides
- **Manual Management**: No automatic garbage collection

### Module Structure:

```wasm
(module
  ;; Imports (optional)
  (import "env" "memory" (memory 1))

  ;; Functions
  (func $myFunction (param i32) (result i32)
    ...
  )

  ;; Exports
  (export "myFunction" (func $myFunction))
)
```

### Stack-Based Execution:

```wasm
;; Example: (2 + 3) * 4
i32.const 2       ;; Push 2
i32.const 3       ;; Push 3
i32.add           ;; Pop 2 values, push sum (5)
i32.const 4       ;; Push 4
i32.mul           ;; Pop 2 values, push product (20)
```

---

## Common Use Cases

### 1. Image Processing

```javascript
// Rust code compiled to WASM
pub fn apply_filter(pixels: &mut [u8]) {
    for pixel in pixels {
        *pixel = (*pixel as f32 * 0.8) as u8;
    }
}
```

**Benefits**: Process millions of pixels efficiently

### 2. Game Engines

- Physics calculations
- Collision detection
- Path finding algorithms
- Unity/Unreal Engine web exports

### 3. Cryptography

```javascript
// Hash computation, encryption/decryption
const hash = wasmModule.exports.sha256(data);
```

**Benefits**: Faster encryption without exposing source

### 4. Video/Audio Codecs

- FFmpeg compiled to WASM
- Real-time video processing
- Audio synthesis

### 5. Scientific Computing

- Mathematical simulations
- Data analysis
- Machine learning inference (TensorFlow.js)

---

## Limitations

### 1. DOM Access

- **Cannot** directly manipulate DOM
- Must communicate through JavaScript
- Use for computation, not UI updates

### 2. Overhead for Small Tasks

```javascript
// Bad: WASM overhead > computation time
wasm.add(2, 3);  // Slower than JS for simple ops

// Good: WASM shines with heavy computation
wasm.processMillionItems(data);
```

### 3. Debugging

- Binary format is hard to read
- Limited browser debugging tools
- Use source maps and WAT format for development

### 4. File Size

- Initial download size
- Compile time on first load
- Solution: Streaming compilation

### 5. Browser Support

- Modern browsers only (2017+)
- No IE11 support
- Check compatibility: `typeof WebAssembly !== 'undefined'`

---

## WebAssembly Text Format (WAT)

### Our Example Explained:

```wasm
(module
  (func $sum_upto (param $n i32) (result i32)
    (local $i i32)      ;; Loop counter
    (local $sum i32)    ;; Accumulator

    ;; Initialize variables
    (local.set $i (i32.const 1))
    (local.set $sum (i32.const 0))

    ;; Loop structure
    (block $break
      (loop $continue
        ;; Exit condition: if i > n
        (br_if $break (i32.gt_s (local.get $i) (local.get $n)))

        ;; sum += i
        (local.set $sum (i32.add (local.get $sum) (local.get $i)))

        ;; i++
        (local.set $i (i32.add (local.get $i) (i32.const 1)))

        ;; Continue loop
        (br $continue)
      )
    )

    ;; Return sum
    (local.get $sum)
  )

  ;; Export function to JavaScript
  (export "sum_upto" (func $sum_upto))
)
```

### Key Instructions:

| Instruction | Description |
|-------------|-------------|
| `local.get` | Read local variable |
| `local.set` | Write local variable |
| `i32.const` | Push constant integer |
| `i32.add` | Add two integers |
| `i32.gt_s` | Greater than (signed) |
| `br_if` | Branch if condition true |
| `br` | Unconditional branch |

---

## Compiling WAT to WASM

### Using Online Tools:

1. **WasmFiddle**: https://wasdk.github.io/WasmFiddle/
2. **WebAssembly Studio**: https://webassembly.studio/

### Using Command Line:

```bash
# Install WABT (WebAssembly Binary Toolkit)
npm install -g wabt

# Compile WAT to WASM
wat2wasm sum.wat -o sum.wasm

# Decompile WASM to WAT (for inspection)
wasm2wat sum.wasm -o output.wat
```

### Using npx (No Installation):

```bash
npx -y wat2wasm sum.wat -o sum.wasm
```

---

## JavaScript ↔ WebAssembly Communication

### Passing Data:

```javascript
// Simple types (numbers)
const result = instance.exports.add(5, 3);

// Arrays via shared memory
const memory = new WebAssembly.Memory({ initial: 1 });
const view = new Uint8Array(memory.buffer);

// Write data
view[0] = 42;

// WASM can read from same memory
```

### Memory Sharing:

```wasm
(module
  (memory (export "memory") 1)  ;; Export memory

  (func $readByte (param $addr i32) (result i32)
    (i32.load8_u (local.get $addr))
  )
)
```

---

## Best Practices

### 1. Use for CPU-Intensive Tasks

Good candidates:
- Loops with millions of iterations
- Complex mathematical operations
- Data processing pipelines

Bad candidates:
- Simple arithmetic
- DOM manipulation
- String operations

### 2. Minimize JS ↔ WASM Calls

```javascript
// Bad: Call WASM in loop
for (let i = 0; i < 1000000; i++) {
    wasm.process(i);  // Overhead!
}

// Good: Pass array to WASM
wasm.processArray(data);  // One call
```

### 3. Use Streaming Compilation

```javascript
// Better for large WASM files
WebAssembly.instantiateStreaming(fetch('module.wasm'))
    .then(result => {
        // Use result.instance
    });
```

### 4. Cache Compiled Modules

```javascript
// Store in IndexedDB for repeat visits
const cachedModule = await WebAssembly.compile(bytes);
localStorage.setItem('wasmModule', cachedModule);
```

---

## Performance Measurement Tips

### 1. Use Multiple Metrics

```javascript
// Both browser APIs
console.time("Operation");
const start = performance.now();
// ... code ...
const end = performance.now();
console.timeEnd("Operation");
console.log(`High-res: ${end - start}ms`);
```

### 2. Warm-Up Runs

```javascript
// Run once to warm up JIT
sumUptoJS(1000);

// Now measure
console.time("JS sum");
sumUptoJS(100_000_000);
console.timeEnd("JS sum");
```

### 3. Statistical Analysis

Run multiple times and average results for accuracy.

---

## Common Errors & Solutions

### Error: "TypeError: Failed to fetch"

**Cause**: Not using HTTP server (file:// protocol)

**Solution**: Use `python3 -m http.server`

### Error: "CompileError: WebAssembly.instantiate()"

**Cause**: Corrupted or invalid WASM file

**Solution**: Recompile from WAT source

### Error: Integer Overflow

**Cause**: Sum exceeds i32 max (2,147,483,647)

**Solution**: Use `i64` type or implement BigInt support

---

## Further Learning

### Official Resources:

- **WebAssembly Docs**: https://webassembly.org/
- **MDN Guide**: https://developer.mozilla.org/en-US/docs/WebAssembly
- **Specification**: https://webassembly.github.io/spec/

### Tools & Frameworks:

- **Emscripten**: C/C++ to WASM compiler
- **wasm-pack**: Rust to WASM toolkit
- **AssemblyScript**: TypeScript-like language for WASM
- **WABT**: WebAssembly Binary Toolkit

### Example Projects:

- **Figma**: Design tool (C++ → WASM)
- **Google Earth**: 3D rendering
- **AutoCAD**: CAD in browser
- **TensorFlow.js**: ML inference

### Books:

- "Programming WebAssembly with Rust" by Kevin Hoffman
- "WebAssembly in Action" by Gerard Gallant

### Interactive Learning:

- https://wasmbyexample.dev/
- https://rustwasm.github.io/book/

---

## Conclusion

WebAssembly is a powerful tool for bringing high-performance computing to the web. While JavaScript remains essential for DOM manipulation and general web development, WASM excels at computational tasks.

**Key Takeaways**:
- WASM runs at near-native speed
- Best for CPU-intensive operations
- Works alongside JavaScript, not replacing it
- Growing ecosystem with multiple language support
- Production-ready and widely adopted

Experiment with this demo, try different values, and explore building your own WASM modules!

---

## License

This project is for educational purposes. Feel free to use and modify.

## Questions?

Explore the code, experiment with different numbers, and see how performance scales!
