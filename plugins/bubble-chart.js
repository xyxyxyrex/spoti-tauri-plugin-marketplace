// ============================================================================
// --- Spoti-Tauri Bubble Mastery Chart Plugin (v1.0.0) ---
// ============================================================================

const PALETTE = [
    "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c",
    "#3498db", "#9b59b6", "#e91e63", "#00bcd4", "#ff5722", "#9c27b0"
];

function hashColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTE[Math.abs(hash) % PALETTE.length];
}

function launchBubbleChart() {
    window.spotiTauri.getHistory()
        .then(rawHistory => {
            // Normalize history payload (robust dictionary & array compatibility)
            const songsList = [];
            if (rawHistory && typeof rawHistory === "object" && !Array.isArray(rawHistory.history)) {
                Object.values(rawHistory).forEach(item => {
                    const plays = Array.isArray(item.play_timestamps) ? item.play_timestamps.length : 1;
                    songsList.push({
                        id: item.id,
                        title: item.title || "Unknown Title",
                        artist: item.artist || "Unknown Artist",
                        album: item.album || "",
                        image: item.image || "",
                        playCount: plays
                    });
                });
            } else {
                const list = Array.isArray(rawHistory) ? rawHistory : (rawHistory?.history || []);
                const agg = {};
                list.forEach(t => {
                    const key = `${t.title}::${t.artist}`;
                    if (!agg[key]) {
                        agg[key] = { ...t, playCount: 0 };
                    }
                    agg[key].playCount++;
                });
                Object.values(agg).forEach(item => {
                    songsList.push({
                        id: item.id || Math.random().toString(36).substr(2, 9),
                        title: item.title || "Unknown Title",
                        artist: item.artist || "Unknown Artist",
                        album: item.album || "",
                        image: item.image || "",
                        playCount: item.playCount || 1
                    });
                });
            }

            if (songsList.length === 0) {
                alert("No playback history found yet. Play some tracks first to generate your Mastery Chart!");
                return;
            }

            // Take Top 100 played songs
            const topSongs = songsList.sort((a, b) => b.playCount - a.playCount).slice(0, 100);

            // Construct and inject modal overlay
            let overlay = document.getElementById("bubble-chart-overlay");
            if (overlay) overlay.remove();

            overlay = document.createElement("div");
            overlay.id = "bubble-chart-overlay";
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(8, 6, 12, 0.93);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 100000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-family: 'Outfit', 'Inter', sans-serif;
                animation: bcFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            `;

            // Append custom animation keyframes and interactive styles
            const styleTag = document.createElement("style");
            styleTag.innerHTML = `
                @keyframes bcFadeIn {
                    from { opacity: 0; transform: scale(1.02); }
                    to { opacity: 1; transform: scale(1.0); }
                }
                #btn-export-chart {
                    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
                }
                #btn-export-chart:hover {
                    background: rgba(29, 185, 84, 0.25) !important;
                    border-color: rgba(29, 185, 84, 0.7) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(29, 185, 84, 0.35);
                }
                #btn-export-chart:active {
                    transform: translateY(0);
                }
                #btn-close-chart {
                    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
                }
                #btn-close-chart:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.15);
                }
                #btn-close-chart:active {
                    transform: translateY(0);
                }
                #bubble-detail-panel {
                    transform: translate(-50%, 12px) scale(0.96) !important;
                    transition: opacity 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
                }
                #bubble-detail-panel.visible {
                    opacity: 1 !important;
                    transform: translate(-50%, 0) scale(1.0) !important;
                    pointer-events: auto !important;
                }
            `;
            document.head.appendChild(styleTag);

            overlay.innerHTML = `
                <div style="
                    position: relative;
                    width: 92%;
                    max-width: 950px;
                    height: 86vh;
                    background: rgba(20, 15, 28, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 24px;
                    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.85);
                ">
                    <!-- Title Bar -->
                    <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; z-index: 10;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.6rem; font-weight: 800; color: #ffb86c; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px;">
                                🫧 Bubble Mastery Chart
                            </h2>
                            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: rgba(255, 255, 255, 0.55); font-family: monospace;">
                                Top 100 most played tracks packed by play volume
                            </p>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button id="btn-export-chart" style="
                                background: rgba(29, 185, 84, 0.12);
                                border: 1px solid rgba(29, 185, 84, 0.3);
                                color: #1db954;
                                padding: 8px 16px;
                                border-radius: 50px;
                                font-weight: bold;
                                cursor: pointer;
                                font-family: inherit;
                                font-size: 0.85rem;
                                transition: all 0.2s ease;
                            ">
                                📥 Export Image
                            </button>
                            <button id="btn-close-chart" style="
                                background: rgba(255, 255, 255, 0.06);
                                border: 1px solid rgba(255, 255, 255, 0.08);
                                color: #fff;
                                padding: 8px 16px;
                                border-radius: 50px;
                                font-weight: bold;
                                cursor: pointer;
                                font-family: inherit;
                                font-size: 0.85rem;
                                transition: all 0.2s ease;
                            ">
                                Close
                            </button>
                        </div>
                    </div>

                    <!-- Canvas Box Container -->
                    <div id="chart-canvas-container" style="
                        position: relative;
                        flex: 1;
                        width: 100%;
                        background: rgba(0, 0, 0, 0.35);
                        border-radius: 16px;
                        border: 1px solid rgba(255, 255, 255, 0.04);
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <canvas id="mastery-canvas" style="width: 100%; height: 100%; display: block; cursor: default;"></canvas>
                        
                        <!-- Dynamic Floating Detail Panel -->
                        <div id="bubble-detail-panel" style="
                            position: absolute;
                            bottom: 16px;
                            left: 50%;
                            background: rgba(28, 20, 42, 0.85);
                            backdrop-filter: blur(12px);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 12px;
                            padding: 10px 20px;
                            display: flex;
                            align-items: center;
                            gap: 14px;
                            max-width: 80%;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            opacity: 0;
                            pointer-events: none;
                            z-index: 100;
                        "></div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Set up Canvas
            const canvas = document.getElementById("mastery-canvas");
            const container = document.getElementById("chart-canvas-container");
            const ctx = canvas.getContext("2d");

            // Handle device pixel ratio for ultra-crisp resolution
            let width = container.clientWidth;
            let height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            let centerX = width / 2;
            let centerY = height / 2;

            // Load Image caching map
            const imageCache = {};
            topSongs.forEach(song => {
                if (song.image) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = song.image;
                    img.onload = () => {
                        imageCache[song.id] = img;
                    };
                    img.onerror = () => {
                        imageCache[song.id] = "failed";
                    };
                    imageCache[song.id] = img;
                } else {
                    imageCache[song.id] = "failed";
                }
            });

            // Calculate bubble radii mapped to square root of plays
            const maxPlays = topSongs[0].playCount;
            const minPlays = topSongs[topSongs.length - 1].playCount;

            topSongs.forEach(song => {
                const ratio = maxPlays > 0 ? song.playCount / maxPlays : 0.5;
                // Perfect bubble radii scale mapping
                const r = 24 + Math.sqrt(ratio) * 62; 
                song.r = r;
                song.baseR = r;
                song.targetR = r;
                
                // Spawn randomly dispersed around the center
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 200;
                song.x = centerX + Math.cos(angle) * distance;
                song.y = centerY + Math.sin(angle) * distance;
                song.vx = 0;
                song.vy = 0;
            });

            let hoveredSong = null;
            const detailPanel = document.getElementById("bubble-detail-panel");

            // Set up mouse events
            canvas.addEventListener("mousemove", (e) => {
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                let match = null;
                topSongs.forEach(song => {
                    const dist = Math.hypot(song.x - mx, song.y - my);
                    if (dist < song.r) {
                        match = song;
                    }
                });

                if (match !== hoveredSong) {
                    if (hoveredSong) hoveredSong.targetR = hoveredSong.baseR; // reset
                    hoveredSong = match;
                    if (hoveredSong) {
                        hoveredSong.targetR = hoveredSong.baseR * 1.15; // scale up
                        
                        // Populate Detail Panel HTML
                        detailPanel.innerHTML = `
                            <div style="width: 38px; height: 38px; border-radius: 6px; overflow: hidden; background: #282828; flex-shrink: 0;">
                                ${songImageHtml(hoveredSong)}
                            </div>
                            <div style="display: flex; flex-direction: column; min-width: 0;">
                                <span style="font-weight: bold; font-size: 0.9rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">${hoveredSong.title}</span>
                                <span style="font-size: 0.75rem; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;">by ${hoveredSong.artist}</span>
                            </div>
                            <div style="border-left: 1px solid rgba(255, 255, 255, 0.15); padding-left: 14px; display: flex; flex-direction: column; align-items: flex-end;">
                                <span style="font-weight: 800; font-size: 1.1rem; color: #1db954; font-family: monospace; line-height: 1;">${hoveredSong.playCount}</span>
                                <span style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Plays</span>
                            </div>
                        `;
                        detailPanel.classList.add("visible");
                    } else {
                        detailPanel.classList.remove("visible");
                    }
                }
            });

            function songImageHtml(song) {
                const img = imageCache[song.id];
                if (img && img instanceof HTMLImageElement && img.complete) {
                    return `<img src="${song.image}" style="width:100%; height:100%; object-fit:cover;" />`;
                }
                return `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:${hashColor(song.title)}; color:#fff; font-weight:bold; font-size:0.9rem;">${song.title.charAt(0).toUpperCase()}</div>`;
            }

            canvas.onmouseout = () => {
                if (hoveredSong) {
                    hoveredSong.targetR = hoveredSong.baseR;
                    hoveredSong = null;
                }
                detailPanel.classList.remove("visible");
            };

            // Main physics update loop
            let isRunning = true;
            function animate() {
                if (!isRunning) return;
                
                // Relaxation Simulation Parameters
                const gravity = 0.055;
                const friction = 0.82;

                // 1. Force towards Center
                topSongs.forEach(c => {
                    c.vx += (centerX - c.x) * gravity;
                    c.vy += (centerY - c.y) * gravity;
                    c.x += c.vx;
                    c.y += c.vy;
                    c.vx *= friction;
                    c.vy *= friction;

                    // Interpolate towards animated radius targets smoothly
                    if (c.targetR) {
                        c.r += (c.targetR - c.r) * 0.16;
                    }
                });

                // 2. Collision detection and push resolution
                for (let i = 0; i < topSongs.length; i++) {
                    for (let j = i + 1; j < topSongs.length; j++) {
                        const c1 = topSongs[i];
                        const c2 = topSongs[j];
                        const dx = c2.x - c1.x;
                        const dy = c2.y - c1.y;
                        const dist = Math.hypot(dx, dy);
                        const minDist = c1.r + c2.r + 3.2; // 3.2px gaps for elegant packed border offsets

                        if (dist < minDist) {
                            const d = dist === 0 ? 0.1 : dist;
                            const overlap = minDist - d;
                            const forceX = (dx / d) * overlap * 0.52;
                            const forceY = (dy / d) * overlap * 0.52;

                            c1.x -= forceX;
                            c1.y -= forceY;
                            c2.x += forceX;
                            c2.y += forceY;
                        }
                    }
                }

                // Render all nodes
                ctx.clearRect(0, 0, width, height);

                // Draw circles
                topSongs.forEach(c => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                    ctx.clip();

                    const img = imageCache[c.id];
                    if (img && img instanceof HTMLImageElement && img.complete && img.naturalWidth !== 0) {
                        ctx.drawImage(img, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
                    } else {
                        // High-end placeholder vector gradients
                        const grad = ctx.createLinearGradient(c.x - c.r, c.y - c.r, c.x + c.r, c.y + c.r);
                        grad.addColorStop(0, hashColor(c.title));
                        grad.addColorStop(1, hashColor(c.artist));
                        ctx.fillStyle = grad;
                        ctx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);

                        ctx.fillStyle = "#ffffff";
                        ctx.font = `bold ${c.r * 0.45}px "Outfit", "Inter", sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText((c.title || "?").charAt(0).toUpperCase(), c.x, c.y);
                    }

                    // --- Premium Glass Bubble Glossy Overlays ---
                    const glossyGrad = ctx.createRadialGradient(
                        c.x - c.r * 0.3, c.y - c.r * 0.3, c.r * 0.1,
                        c.x, c.y, c.r
                    );
                    glossyGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
                    glossyGrad.addColorStop(0.5, "rgba(255, 255, 255, 0)");
                    glossyGrad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
                    ctx.fillStyle = glossyGrad;
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                    ctx.fill();

                    // Sleek reflection crescent highlight on top-left
                    ctx.beginPath();
                    ctx.arc(c.x - c.r * 0.15, c.y - c.r * 0.15, c.r * 0.82, Math.PI * 1.0, Math.PI * 1.55);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.lineWidth = Math.max(1.2, c.r * 0.05);
                    ctx.stroke();

                    ctx.restore();

                    // Elegant Outer Ring Outline & Neon Hover Glow
                    if (c === hoveredSong) {
                        ctx.save();
                        ctx.shadowBlur = 18;
                        ctx.shadowColor = "#ffb86c";
                        ctx.beginPath();
                        ctx.arc(c.x, c.y, c.r + 1, 0, Math.PI * 2);
                        ctx.lineWidth = 3.2;
                        ctx.strokeStyle = "#ffb86c";
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        ctx.beginPath();
                        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                        ctx.lineWidth = 1.4;
                        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                        ctx.stroke();
                    }
                });

                // Draw concentric legend inside the top right region
                drawMasteryLegend(ctx, width, height, maxPlays, minPlays);

                requestAnimationFrame(animate);
            }

            function drawMasteryLegend(ctx, w, h, max, min) {
                // Outer ring anchors
                const lx = w - 90;
                const ly = 100;
                const legendSizes = [
                    { label: `${max} plays`, r: 24 + Math.sqrt(1.0) * 62 },
                    { label: `${Math.round(max * 0.5)} plays`, r: 24 + Math.sqrt(0.5) * 62 },
                    { label: `${Math.round(max * 0.15)} plays`, r: 24 + Math.sqrt(0.15) * 62 }
                ];

                ctx.save();
                legendSizes.forEach(item => {
                    ctx.beginPath();
                    ctx.arc(lx, ly + (legendSizes[0].r - item.r), item.r, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                    ctx.lineWidth = 1.0;
                    ctx.stroke();

                    // Text labels aligned right beside tangent arches
                    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
                    ctx.font = 'bold 8px monospace';
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    ctx.fillText(item.label, lx - item.r - 8, ly + (legendSizes[0].r - item.r) * 2 - item.r);
                });
                ctx.restore();
            }

            animate();

            // Export Image functionality
            document.getElementById("btn-export-chart").addEventListener("click", () => {
                // Generate a full high-resolution capture without control buttons
                const downloadLink = document.createElement("a");
                downloadLink.download = `SpotDL-Bubble-Mastery-Chart.png`;
                downloadLink.href = canvas.toDataURL("image/png");
                downloadLink.click();
                window.spotiTauri.showStatus("Mastery Chart PNG exported successfully!");
            });

            // Close button click handler
            document.getElementById("btn-close-chart").addEventListener("click", () => {
                isRunning = false;
                overlay.remove();
            });
        })
        .catch(err => {
            console.error("Failed to compile bubble mastery chart:", err);
            alert("Error loading bubble mastery chart: " + err.message);
        });
}

// Register with spotiTauri plugin framework
if (window.spotiTauri && typeof window.spotiTauri.registerPlugin === "function") {
    window.spotiTauri.registerPlugin({
        id: "bubble-chart",
        name: "Bubble Mastery",
        description: "Generates a dynamic packed circle bubble chart of your top 100 played songs mapped visually by playcount.",
        icon: "🫧",
        lastUpdated: "24-May-2026",
        downloads: 112,
        launch: launchBubbleChart
    });
}
