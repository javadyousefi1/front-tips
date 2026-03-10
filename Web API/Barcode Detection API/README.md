# 📷 Barcode Detection API

## What Is It?

The **Barcode Detection API** lets you detect and decode barcodes and QR codes directly in the browser — from images, video frames, or canvas elements. No library needed.

```javascript
const detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13'] });
const barcodes = await detector.detect(imageElement);
// barcodes[0].rawValue → "https://example.com"
// barcodes[0].format   → "qr_code"
```

---

## Core API

```javascript
// 1. Check support
if (!('BarcodeDetector' in window)) {
  console.log('Not supported');
}

// 2. Get all supported formats
const formats = await BarcodeDetector.getSupportedFormats();
// ['aztec', 'code_128', 'ean_13', 'qr_code', ...]

// 3. Create a detector
const detector = new BarcodeDetector({
  formats: ['qr_code', 'ean_13', 'code_128']
});

// 4. Detect from an image element
const results = await detector.detect(img);

// 5. Each result has:
results.forEach(barcode => {
  barcode.rawValue    // decoded string
  barcode.format      // 'qr_code', 'ean_13', etc.
  barcode.boundingBox // DOMRectReadOnly {x, y, width, height}
  barcode.cornerPoints // [{x,y}, {x,y}, {x,y}, {x,y}]
});
```

---

## Detect from Camera (Live)

```javascript
const detector = new BarcodeDetector({ formats: ['qr_code'] });
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const video = document.querySelector('video');
video.srcObject = stream;

// Scan every 300ms
setInterval(async () => {
  const barcodes = await detector.detect(video);
  if (barcodes.length > 0) {
    console.log('Found:', barcodes[0].rawValue);
  }
}, 300);
```

---

## Supported Formats

| Format | Description |
|--------|-------------|
| `qr_code` | QR Code |
| `ean_13` | EAN-13 (retail barcodes) |
| `ean_8` | EAN-8 |
| `code_128` | Code 128 |
| `code_39` | Code 39 |
| `aztec` | Aztec |
| `data_matrix` | Data Matrix |
| `pdf417` | PDF417 |
| `upc_a` | UPC-A |
| `upc_e` | UPC-E |

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 83+ (desktop) | ✅ |
| Edge 83+ | ✅ |
| Chrome Android | ✅ |
| Safari | ❌ |
| Firefox | ❌ |

---

## Resources
- [MDN Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API)
- [Can I Use](https://caniuse.com/mdn-api_barcodedetector)
