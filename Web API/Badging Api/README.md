# 🔴 Badging API - Complete Guide

## What Is It?

The **Badging API** lets installed PWAs (Progressive Web Apps) show a small badge on their app icon — like a notification count on a mobile app icon. It's purely visual: it doesn't send notifications, just updates the icon badge.

```
┌──────────────┐
│   App Icon   │ ← badge appears here (number or dot)
│      🔴3     │
└──────────────┘
```

---

## The Two Methods

```javascript
// Set a numeric badge
navigator.setAppBadge(5);       // shows "5" on the icon
navigator.setAppBadge(0);       // shows a plain dot (zero = dot in most OSes)
navigator.setAppBadge();        // also shows a plain dot

// Clear the badge
navigator.clearAppBadge();      // removes the badge entirely
```

That's the whole API.

---

## Basic Usage

```javascript
// Check support first
if ('setAppBadge' in navigator) {
  // Set a badge with count
  await navigator.setAppBadge(42);
  console.log('Badge set to 42');
} else {
  console.log('Badging API not supported');
}

// Clear the badge
if ('clearAppBadge' in navigator) {
  await navigator.clearAppBadge();
}
```

---

## Real-World Examples

### Unread Messages Counter
```javascript
async function updateUnreadBadge(count) {
  if (!('setAppBadge' in navigator)) return;

  if (count > 0) {
    await navigator.setAppBadge(count);
  } else {
    await navigator.clearAppBadge();
  }
}

// Usage
updateUnreadBadge(3);   // badge shows "3"
updateUnreadBadge(0);   // badge cleared
```

### Badge on New Notification
```javascript
let unreadCount = 0;

function onNewMessage(message) {
  unreadCount++;
  navigator.setAppBadge(unreadCount).catch(console.error);
}

function onMessagesRead() {
  unreadCount = 0;
  navigator.clearAppBadge().catch(console.error);
}
```

### Cap Large Numbers
```javascript
function setBadge(count) {
  if (!('setAppBadge' in navigator)) return;
  // Show "99+" visually but badge just shows 99
  navigator.setAppBadge(Math.min(count, 99));
}
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 81+ (installed PWA) | ✅ |
| Edge 81+ (installed PWA) | ✅ |
| Safari 17.4+ | ✅ |
| Firefox | ❌ |

**Important:** On desktop, the app must be **installed as a PWA** to show the badge on the OS app icon. In a regular browser tab, the API still works without errors but you won't see a visible badge on the taskbar/dock.

---

## Key Points

- Works best on **installed PWAs** (not regular browser tabs)
- Both methods return a **Promise** — use `await` or `.catch()`
- Passing `0` or no argument shows a **plain dot**, not "0"
- The OS controls the actual visual appearance of the badge
- No permission required from the user

---

## Resources
- [MDN Badging API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API)
- [Can I Use - Badging](https://caniuse.com/mdn-api_navigator_setappbadge)
