// =============================================================
// --- Receiptify Plugin — Grocery Receipt Stats Engine ---
// =============================================================

const { invoke } = window.__TAURI__.core;

// Generate styles for receiptify
const injectStyles = () => {
    if (document.getElementById("receiptify-plugin-styles")) return;
    
    const style = document.createElement("style");
    style.id = "receiptify-plugin-styles";
    style.textContent = `
        .receiptify-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(12, 12, 14, 0.92);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(12px);
            overflow-y: auto;
        }
        
        .receiptify-modal-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 390px;
            animation: receiptSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes receiptSlideUp {
            from {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .receiptify-paper {
            background: #faf8f5;
            color: #1a1a1a;
            font-family: 'Courier New', Courier, monospace;
            width: 100%;
            padding: 45px 32px 35px 32px;
            box-sizing: border-box;
            box-shadow: 
                0 25px 50px -12px rgba(0,0,0,0.7),
                0 0 40px rgba(0,0,0,0.04) inset;
            position: relative;
            overflow: hidden;
            /* Jagged rip/zig-zag edge styling */
            clip-path: polygon(
                0% 0%, 2.5% 1.8%, 5% 0%, 7.5% 1.8%, 10% 0%, 12.5% 1.8%, 15% 0%, 17.5% 1.8%, 20% 0%, 22.5% 1.8%, 25% 0%, 27.5% 1.8%, 30% 0%, 32.5% 1.8%, 35% 0%, 37.5% 1.8%, 40% 0%, 42.5% 1.8%, 45% 0%, 47.5% 1.8%, 50% 0%, 52.5% 1.8%, 55% 0%, 57.5% 1.8%, 60% 0%, 62.5% 1.8%, 65% 0%, 67.5% 1.8%, 70% 0%, 72.5% 1.8%, 75% 0%, 77.5% 1.8%, 80% 0%, 82.5% 1.8%, 85% 0%, 87.5% 1.8%, 90% 0%, 92.5% 1.8%, 95% 0%, 97.5% 1.8%, 100% 0%,
                100% 100%, 97.5% 98.2%, 95% 100%, 92.5% 98.2%, 90% 100%, 87.5% 98.2%, 85% 100%, 82.5% 98.2%, 80% 100%, 77.5% 98.2%, 75% 100%, 72.5% 98.2%, 70% 100%, 67.5% 98.2%, 65% 100%, 62.5% 98.2%, 60% 100%, 57.5% 98.2%, 55% 100%, 52.5% 98.2%, 50% 100%, 47.5% 98.2%, 45% 100%, 42.5% 98.2%, 40% 100%, 37.5% 98.2%, 35% 100%, 32.5% 98.2%, 30% 100%, 27.5% 98.2%, 25% 100%, 22.5% 98.2%, 20% 100%, 17.5% 98.2%, 15% 100%, 12.5% 98.2%, 10% 100%, 7.5% 98.2%, 5% 100%, 2.5% 98.2%, 0% 100%
            );
            transform: rotate(-1.5deg);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .receiptify-paper:hover {
            transform: rotate(0deg) scale(1.02);
        }
        
        /* Multiple overlapping gradients simulating realistic folds, creases, and shadows */
        .receiptify-creases {
            position: absolute;
            top: -20%;
            left: -20%;
            width: 140%;
            height: 140%;
            pointer-events: none;
            background: 
                linear-gradient(125deg, transparent 48%, rgba(0,0,0,0.06) 49.5%, rgba(255,255,255,0.75) 50.2%, transparent 51.5%),
                linear-gradient(40deg, transparent 47%, rgba(0,0,0,0.08) 49.2%, rgba(255,255,255,0.7) 49.8%, transparent 51.5%),
                linear-gradient(160deg, transparent 49%, rgba(0,0,0,0.05) 50%, rgba(255,255,255,0.65) 50.5%, transparent 52%),
                linear-gradient(230deg, transparent 48.5%, rgba(0,0,0,0.06) 49.5%, rgba(255,255,255,0.65) 50.2%, transparent 52%);
            mix-blend-mode: multiply;
            z-index: 15;
        }

        .receiptify-close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            font-size: 20px;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s;
            z-index: 10005;
        }
        
        .receiptify-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.08) rotate(90deg);
        }
        
        .receiptify-action-row {
            display: flex;
            gap: 15px;
            margin-top: 25px;
            z-index: 10005;
        }
        
        .receiptify-btn {
            padding: 12px 28px;
            border: none;
            color: #fff;
            font-size: 0.9rem;
            font-weight: 700;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .receiptify-btn-save {
            background: #1db954;
            box-shadow: 0 4px 15px rgba(29, 185, 84, 0.35);
        }
        .receiptify-btn-save:hover {
            background: #1ed760;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(29, 185, 84, 0.5);
        }
        
        .receiptify-btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .receiptify-btn-cancel:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .receiptify-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .receiptify-header h1 {
            font-size: 1.45rem;
            font-weight: 900;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .receiptify-header p {
            font-size: 0.72rem;
            margin: 6px 0 0 0;
            color: #555;
            letter-spacing: 0.5px;
        }
        
        .receiptify-meta {
            font-size: 0.76rem;
            margin-bottom: 20px;
            line-height: 1.5;
            border-bottom: 1px dashed #444;
            border-top: 1px dashed #444;
            padding: 10px 0;
            text-transform: uppercase;
        }
        
        .receiptify-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        
        .receiptify-th {
            font-weight: 700;
            font-size: 0.8rem;
            border-bottom: 1px dashed #444;
            padding-bottom: 8px;
            text-align: left;
            text-transform: uppercase;
        }
        
        .receiptify-tr-item td {
            padding-top: 14px;
        }
        
        .receiptify-td-qty {
            width: 12%;
            font-size: 0.82rem;
            vertical-align: top;
        }
        
        .receiptify-td-prod {
            width: 63%;
            font-size: 0.82rem;
            vertical-align: top;
            text-transform: uppercase;
            font-weight: 700;
        }
        
        .receiptify-td-prod .artist {
            font-size: 0.7rem;
            color: #555;
            margin-top: 2px;
            font-weight: normal;
        }
        
        .receiptify-td-price {
            width: 25%;
            font-size: 0.82rem;
            text-align: right;
            vertical-align: top;
        }
        
        .receiptify-totals {
            border-top: 1px dashed #444;
            border-bottom: 1px dashed #444;
            padding: 12px 0;
            font-size: 0.8rem;
            line-height: 1.6;
        }
        
        .receiptify-total-row {
            display: flex;
            justify-content: space-between;
            text-transform: uppercase;
        }
        
        .receiptify-total-row.bold {
            font-weight: 900;
            font-size: 0.92rem;
            margin-top: 6px;
        }
        
        .receiptify-footer {
            text-align: center;
            font-size: 0.72rem;
            margin-top: 25px;
            color: #444;
            line-height: 1.4;
        }
        
        .receiptify-barcode-container {
            display: flex;
            justify-content: center;
            margin: 18px 0 12px 0;
        }
        
        .receiptify-barcode-bar {
            background-color: #1a1a1a;
            height: 42px;
        }
    `;
    document.head.appendChild(style);
};

// Generate barcode DOM using custom height and width segments
const generateBarcodeHtml = () => {
    const barWidths = [1, 2, 1, 3, 1, 4, 2, 1, 1, 3, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1, 1, 2];
    let html = `<div style="display: flex; align-items: stretch; height: 40px;">`;
    barWidths.forEach((width, index) => {
        const isBlack = index % 2 === 0;
        const color = isBlack ? "#1a1a1a" : "transparent";
        html += `<div style="width: ${width}px; background-color: ${color}; height: 100%;"></div>`;
    });
    html += `</div>`;
    return html;
};

// Format seconds into price style $M.SS
const formatDurationToPrice = (durationSecs) => {
    const d = durationSecs || 200;
    const mins = Math.floor(d / 60);
    const secs = Math.floor(d % 60);
    return `$${mins}.${secs.toString().padStart(2, '0')}`;
};

// Main launcher function
export async function launchReceiptify() {
    injectStyles();
    
    // 1. Fetch real playback history
    let historyList = [];
    try {
        const historyData = await invoke("get_history");
        if (historyData) {
            for (const id in historyData) {
                const item = historyData[id];
                if (item && item.play_timestamps && item.play_timestamps.length > 0) {
                    historyList.push(item);
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch history for Receiptify:", e);
    }
    
    // 2. Fallback mock data if empty
    if (historyList.length === 0) {
        historyList = [
            { title: "Blinding Lights", artist: "The Weeknd", duration_secs: 200, play_timestamps: new Array(12) },
            { title: "Starboy", artist: "The Weeknd", duration_secs: 230, play_timestamps: new Array(8) },
            { title: "Bad Habits", artist: "Ed Sheeran", duration_secs: 231, play_timestamps: new Array(7) },
            { title: "Stay", artist: "Kid LAROI & Justin Bieber", duration_secs: 141, play_timestamps: new Array(6) },
            { title: "Levitating", artist: "Dua Lipa", duration_secs: 203, play_timestamps: new Array(5) },
            { title: "As It Was", artist: "Harry Styles", duration_secs: 167, play_timestamps: new Array(4) },
            { title: "Sweater Weather", artist: "The Neighbourhood", duration_secs: 240, play_timestamps: new Array(3) },
            { title: "Stressed Out", artist: "Twenty One Pilots", duration_secs: 202, play_timestamps: new Array(2) },
            { title: "Die For You", artist: "The Weeknd", duration_secs: 260, play_timestamps: new Array(2) },
            { title: "Save Your Tears", artist: "The Weeknd", duration_secs: 215, play_timestamps: new Array(1) }
        ];
    }
    
    // Sort and slice top 10
    const trackCounts = historyList.map(t => ({
        track: t,
        count: t.play_timestamps.length
    })).sort((a, b) => b.count - a.count).slice(0, 10);
    
    // Calculate receipt prices
    let subtotal = 0;
    const tableRowsHtml = trackCounts.map((item, idx) => {
        const title = item.track.title.length > 18 ? item.track.title.substring(0, 16) + ".." : item.track.title;
        const artist = item.track.artist;
        const durationSecs = item.track.duration_secs || item.track.duration || 200;
        const priceStr = formatDurationToPrice(durationSecs);
        
        // Sum up price value mathematically
        const mins = Math.floor(durationSecs / 60);
        const secs = Math.floor(durationSecs % 60);
        const priceVal = mins + (secs / 100);
        subtotal += priceVal;
        
        const rankStr = (idx + 1).toString().padStart(2, '0');
        
        return `
            <tr class="receiptify-tr-item">
                <td class="receiptify-td-qty">${rankStr}</td>
                <td class="receiptify-td-prod">
                    <div>${title}</div>
                    <div class="artist">${artist}</div>
                </td>
                <td class="receiptify-td-price">${priceStr}</td>
            </tr>
        `;
    }).join("");
    
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    // Format timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const orderNo = Math.floor(1000 + Math.random() * 9000);
    
    // Construct Modal Overlay
    const overlay = document.createElement("div");
    overlay.className = "receiptify-overlay";
    
    overlay.innerHTML = `
        <button type="button" class="receiptify-close-btn" title="Close Overlay">✕</button>
        
        <div class="receiptify-modal-content">
            <div class="receiptify-paper" id="receiptify-paper-card">
                <div class="receiptify-creases"></div>
                
                <div class="receiptify-header">
                    <h1>Spoti-Tauri Mart</h1>
                    <p>321 RUSTIC PIPELINE LANE</p>
                    <p>TAURI OS, ROCKS 94103</p>
                    <p style="margin-top: 8px; font-weight: 700;">STORE RECORD RECEIPT</p>
                </div>
                
                <div class="receiptify-meta">
                    <div>ORDER #${orderNo}</div>
                    <div>DATE: ${dateStr}</div>
                    <div>TIME: ${timeStr}</div>
                    <div>CASHIER: AGENT_ANTIGRAVITY</div>
                </div>
                
                <table class="receiptify-table">
                    <thead>
                        <tr>
                            <th class="receiptify-th" style="text-align: left;">Qty</th>
                            <th class="receiptify-th" style="text-align: left;">Product</th>
                            <th class="receiptify-th" style="text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
                
                <div class="receiptify-totals">
                    <div class="receiptify-total-row">
                        <span>SUBTOTAL</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="receiptify-total-row">
                        <span>TAX (8.0%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="receiptify-total-row bold">
                        <span>TOTAL</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="font-size: 0.8rem; margin: 15px 0; font-weight: 700; text-transform: uppercase;">
                    <div>ITEMS COUNT: 10</div>
                    <div style="margin-top: 5px;">PAYMENT METHOD: DEBIT CARD</div>
                    <div>CARD: ************7777</div>
                    <div>AUTH CODE: ${Math.floor(100000 + Math.random() * 900000)}</div>
                </div>
                
                <div class="receiptify-barcode-container">
                    ${generateBarcodeHtml()}
                </div>
                
                <div class="receiptify-footer">
                    <p>THANK YOU FOR SHOPPING AT SPOTI-TAURI!</p>
                    <p style="margin-top: 5px; font-size: 0.65rem; letter-spacing: 1px;">- BARCODE ENCRYPTS PLAYBACK LOGS -</p>
                </div>
            </div>
            
            <div class="receiptify-action-row">
                <button type="button" class="receiptify-btn receiptify-btn-save" id="receiptify-btn-save">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -1px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Save Image
                </button>
                <button type="button" class="receiptify-btn receiptify-btn-cancel" id="receiptify-btn-cancel">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close functions
    const closeOverlay = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
        }, 300);
    };
    
    overlay.querySelector(".receiptify-close-btn").addEventListener("click", closeOverlay);
    overlay.querySelector("#receiptify-btn-cancel").addEventListener("click", closeOverlay);
    
    // Save image handler
    overlay.querySelector("#receiptify-btn-save").addEventListener("click", async () => {
        const btn = overlay.querySelector("#receiptify-btn-save");
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span>Saving...</span>`;
        
        try {
            const paperCard = overlay.querySelector("#receiptify-paper-card");
            
            // Generate canvas using html2canvas
            const canvas = await html2canvas(paperCard, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: 2 // High resolution scale
            });
            
            // Create download link
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `SpotiTauri_Receipt_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.png`;
            link.href = url;
            link.click();
            
            if (window.spotiTauri && window.spotiTauri.showStatus) {
                window.spotiTauri.showStatus("Receipt image downloaded successfully! 🧾");
            }
        } catch (err) {
            console.error("Failed to generate receipt image:", err);
            alert(`Error saving receipt: ${err.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    });
}

// Register with Spoti-Tauri Plugin Architecture
if (window.spotiTauri && typeof window.spotiTauri.registerPlugin === "function") {
    window.spotiTauri.registerPlugin({
        id: "receiptify",
        name: "Receiptify",
        description: "Transform your playing history into an elegant, high-fidelity grocery receipt to show off on social media.",
        icon: "🧾",
        lastUpdated: "20-May-2026",
        downloads: 1420,
        launch: launchReceiptify
    });
} else {
    // Fallback registration
    window.launchReceiptify = launchReceiptify;
    console.warn("spotiTauri.registerPlugin not available. Registered launchReceiptify globally.");
}
