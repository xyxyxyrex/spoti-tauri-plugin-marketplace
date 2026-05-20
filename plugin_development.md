# Spoti-Tauri Plugin Development Guide

Spoti-Tauri plugins are self-contained ES6 modules (`.js`) loaded dynamically into the application webview. They utilize a sandboxed SDK to communicate with the host Tauri application.

---

## 1. Quick Start

Every plugin must call `window.spotiTauri.registerPlugin()` when executed to register its metadata and hook into the UI.

### Basic Template (`my-plugin.js`)

```javascript
// ==========================================
// Spoti-Tauri Custom Plugin
// ==========================================

const { invoke } = window.__TAURI__.core;

function launchMyPlugin() {
    // 1. Fetch play history
    window.spotiTauri.getHistory()
        .then(history => {
            console.log("Stats fetched:", history);
            window.spotiTauri.showStatus("Successfully launched My Plugin!");
            
            // 2. Open view or show custom modal UI
            // ... Custom modal markup injection
        })
        .catch(err => {
            console.error("Plugin failed to retrieve statistics:", err);
        });
}

// Register Metadata
if (window.spotiTauri && typeof window.spotiTauri.registerPlugin === "function") {
    window.spotiTauri.registerPlugin({
        id: "my-plugin",                     // Unique alphanumeric identifier
        name: "My Custom Visualizer",        // Plugin Title
        description: "An ultra-premium real-time custom visualization helper.",
        icon: "⚡",                           // Unicode Emoji or URL pointing to an icon
        lastUpdated: "20-May-2026",          // Date string
        downloads: 240,                      // Total download counts
        launch: launchMyPlugin               // Callback triggered when "Launch Plugin" is clicked
    });
}
```

---

## 2. Metadata Schema Reference

| Field | Type | Required | Description | Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | Yes | Unique alphanumeric ID matching `/^[a-z0-9-_]+$/i`. | Registration throws validation error. |
| `name` | `String` | Yes | Human-readable name of the plugin displayed on the card. | Registration throws validation error. |
| `description` | `String` | No | Short description of the plugin's capabilities. | "No description provided." |
| `icon` | `String` | No | Unicode emoji icon or absolute image URL path. | Defaults to `🔌` symbol. |
| `lastUpdated` | `String` | No | Last update timestamp (e.g. `20-May-2026`). | Defaults to current locale date. |
| `downloads` | `Number` | No | Metric showing total number of times downloaded. | Defaults to `0`. |
| `launch` | `Function` | Yes | Function called when the user clicks "Launch". | Registration throws validation error. |

---

## 3. Host SDK API (`window.spotiTauri`)

Plugins have access to the global `window.spotiTauri` object:

- `getHistory()`: *Promise<Object>* — Fetches the SQLite database dictionary containing all track play history (track title, artist, album, duration, timestamps, image).
- `showStatus(msg)`: *void* — Displays a transient notification toast/text in the status bar (autoclears in 4 seconds).
- `switchView(viewName)`: *void* — Directs the user to a dashboard view (`"home"`, `"search"`, `"settings"`).
- `invoke(command, args)`: *Promise<any>* — Native bridge to call custom Tauri Rust backend commands.
- `pausePlayback()`: *void* — Pauses host player audio playback to prevent audio overlap.

---

## 4. Sandbox, Import Guards & Error Handling

To ensure high robustness, the import system uses:
1. **Blob URL Isolation:** Dynamic imports execute the module via dynamic Blob URLs to prevent scope collision and obtain accurate Stack Traces for syntax compilation bugs.
2. **ES6 Module Mode:** Imported scripts run in strict mode as ES6 modules.
3. **Guard Validation:** Files loaded through "Load Local Plugin" or "Paste Code" are scanned for `spotiTauri` and `registerPlugin` calls before injection, preventing execution of random non-plugin scripts.

---

## 5. Setting up a Plugin Marketplace

To establish a decentralized, community-driven marketplace:

1. **Marketplace Repository:** 
   Create a public repository (e.g., `github.com/your-org/spotdl-plugin-marketplace`).
2. **Metadata Registry JSON:**
   Host a central `registry.json` list at the repository root:
   ```json
   [
     {
       "id": "receiptify",
       "name": "Receiptify",
       "description": "Transform playing logs into a grocery receipt.",
       "icon": "🧾",
       "url": "https://raw.githubusercontent.com/your-org/spotdl-plugin-marketplace/main/plugins/receiptify.js",
       "downloads": 1420,
       "lastUpdated": "20-May-2026"
     }
   ]
   ```
3. **Dynamic Fetching:**
   The host application can fetch `registry.json` using `fetch()` and dynamically list plugins inside the store view. When an install button is clicked, the app loads the URL from the JSON directly via `document.createElement("script")`!
