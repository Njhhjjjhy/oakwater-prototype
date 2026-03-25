/**
 * DEV ONLY — Breakpoint Preview Tool
 * Floating toolbar that lets you preview the page at exact device dimensions.
 * Toggle with Ctrl+Shift+B or click the floating button.
 * Remove this script before deploying to production.
 */
(function () {
    "use strict";

    var PRESETS = [
        { key: "1", label: "Mobile", device: "iPhone 17 Pro", w: 393, h: 852 },
        { key: "2", label: "Tablet", device: "iPad", w: 768, h: 1024 },
        { key: "3", label: "Desktop", device: '13" Laptop', w: 1280, h: 800 },
        { key: "4", label: "Desktop-LG", device: '15" Laptop', w: 1536, h: 864 },
    ];

    var isActive = false;
    var currentPreset = null;
    var toolbar = null;
    var iframe = null;
    var overlay = null;
    var fab = null;

    // --- Floating Action Button (always visible) ---
    function createFAB() {
        fab = document.createElement("button");
        fab.id = "bp-fab";
        fab.innerHTML = "&#9881;";
        fab.title = "Breakpoint Preview (Ctrl+Shift+B)";
        Object.assign(fab.style, {
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: "99999",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "#2b2d31",
            color: "#fbb931",
            border: "2px solid #40444c",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s ease, background 0.15s ease",
            fontFamily: "system-ui, sans-serif",
        });
        fab.addEventListener("mouseenter", function () {
            fab.style.transform = "scale(1.1)";
        });
        fab.addEventListener("mouseleave", function () {
            fab.style.transform = "scale(1)";
        });
        fab.addEventListener("click", toggle);
        document.body.appendChild(fab);
    }

    // --- Toolbar ---
    function createToolbar() {
        toolbar = document.createElement("div");
        toolbar.id = "bp-toolbar";
        Object.assign(toolbar.style, {
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            zIndex: "100001",
            background: "#2b2d31",
            borderBottom: "2px solid #fbb931",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: "13px",
            flexWrap: "wrap",
        });

        // Title
        var title = document.createElement("span");
        title.textContent = "Breakpoints";
        Object.assign(title.style, { color: "#fbb931", fontWeight: "600", marginRight: "8px", fontSize: "13px" });
        toolbar.appendChild(title);

        // Preset buttons
        PRESETS.forEach(function (p) {
            var btn = document.createElement("button");
            btn.className = "bp-preset";
            btn.dataset.key = p.key;
            btn.innerHTML =
                p.label +
                ' <span style="opacity:0.5;font-size:10px;margin-left:4px;">' +
                p.w +
                "\u00d7" +
                p.h +
                "</span>" +
                ' <span style="opacity:0.3;font-size:10px;margin-left:2px;">' +
                p.key +
                "</span>";
            stylePresetBtn(btn, false);
            btn.addEventListener("click", function () {
                activatePreset(p);
            });
            toolbar.appendChild(btn);
        });

        // Full button (back to normal)
        var fullBtn = document.createElement("button");
        fullBtn.className = "bp-preset";
        fullBtn.dataset.key = "full";
        fullBtn.textContent = "Full";
        stylePresetBtn(fullBtn, false);
        fullBtn.addEventListener("click", deactivatePreview);
        toolbar.appendChild(fullBtn);

        // Separator
        var sep = document.createElement("span");
        sep.style.cssText = "width:1px;height:20px;background:#40444c;margin:0 6px;";
        toolbar.appendChild(sep);

        // Custom inputs
        var customW = createInput("W", 375);
        var customH = createInput("H", 812);
        toolbar.appendChild(customW.wrap);
        var x = document.createElement("span");
        x.textContent = "\u00d7";
        x.style.color = "#6b7280";
        toolbar.appendChild(x);
        toolbar.appendChild(customH.wrap);

        var applyBtn = document.createElement("button");
        applyBtn.textContent = "Apply";
        Object.assign(applyBtn.style, {
            background: "#4a4e5a",
            color: "#edeef1",
            border: "1px solid #5b616e",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: "12px",
            cursor: "pointer",
        });
        applyBtn.addEventListener("click", function () {
            var w = parseInt(customW.input.value, 10);
            var h = parseInt(customH.input.value, 10);
            if (w >= 320 && h >= 320) {
                activatePreset({ label: "Custom", device: w + "\u00d7" + h, w: w, h: h });
            }
        });
        toolbar.appendChild(applyBtn);

        // Enter triggers apply
        [customW.input, customH.input].forEach(function (inp) {
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") applyBtn.click();
            });
        });

        // Separator
        var sep2 = sep.cloneNode();
        toolbar.appendChild(sep2);

        // Dimension label
        var dimLabel = document.createElement("span");
        dimLabel.id = "bp-dim-label";
        Object.assign(dimLabel.style, {
            color: "#8e95a2",
            fontSize: "12px",
            background: "#25272c",
            padding: "3px 8px",
            borderRadius: "4px",
            fontVariantNumeric: "tabular-nums",
        });
        dimLabel.textContent = "Select a breakpoint";
        toolbar.appendChild(dimLabel);

        // Close button (far right)
        var closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        Object.assign(closeBtn.style, {
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#8e95a2",
            fontSize: "18px",
            cursor: "pointer",
            padding: "0 4px",
        });
        closeBtn.addEventListener("click", toggle);
        toolbar.appendChild(closeBtn);

        // Store refs
        toolbar._customW = customW.input;
        toolbar._customH = customH.input;
        toolbar._dimLabel = dimLabel;

        document.body.appendChild(toolbar);
    }

    function createInput(label, val) {
        var wrap = document.createElement("span");
        wrap.style.cssText = "display:inline-flex;align-items:center;gap:3px;";
        var lbl = document.createElement("span");
        lbl.textContent = label;
        lbl.style.cssText = "color:#6b7280;font-size:11px;";
        var input = document.createElement("input");
        input.type = "number";
        input.value = val;
        input.min = 320;
        input.max = 2560;
        Object.assign(input.style, {
            width: "56px",
            background: "#383a42",
            border: "1px solid #4a4e5a",
            borderRadius: "4px",
            color: "#edeef1",
            padding: "3px 6px",
            fontSize: "12px",
            textAlign: "center",
        });
        wrap.appendChild(lbl);
        wrap.appendChild(input);
        return { wrap: wrap, input: input };
    }

    function stylePresetBtn(btn, active) {
        Object.assign(btn.style, {
            background: active ? "#fbb931" : "#383a42",
            color: active ? "#1e1f20" : "#b6bac3",
            border: "1px solid " + (active ? "#fbb931" : "#4a4e5a"),
            borderRadius: "5px",
            padding: "4px 12px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: active ? "600" : "400",
            transition: "all 0.15s ease",
        });
    }

    // --- Overlay + iframe ---
    function createOverlay() {
        overlay = document.createElement("div");
        overlay.id = "bp-overlay";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "42px",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "100000",
            background: "#1e1f20",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "24px",
            overflow: "auto",
        });

        iframe = document.createElement("iframe");
        iframe.id = "bp-iframe";
        iframe.src = window.location.href.split("?")[0] + "?_bp_child=1";
        Object.assign(iframe.style, {
            border: "1px solid #40444c",
            borderRadius: "4px",
            background: "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            transition: "width 0.3s ease, height 0.3s ease",
            width: "375px",
            height: "812px",
            flexShrink: "0",
        });

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);
    }

    // --- Actions ---
    function activatePreset(p) {
        if (!overlay) createOverlay();
        overlay.style.display = "flex";

        iframe.style.width = p.w + "px";
        iframe.style.height = p.h + "px";

        // Update button states
        toolbar.querySelectorAll(".bp-preset").forEach(function (btn) {
            var isThis = btn.dataset.key === p.key;
            stylePresetBtn(btn, isThis);
        });

        // Update inputs & label
        toolbar._customW.value = p.w;
        toolbar._customH.value = p.h;
        toolbar._dimLabel.textContent = p.label + " (" + p.device + ") \u2014 " + p.w + " \u00d7 " + p.h;

        currentPreset = p;
    }

    function deactivatePreview() {
        if (overlay) overlay.style.display = "none";
        toolbar.querySelectorAll(".bp-preset").forEach(function (btn) {
            stylePresetBtn(btn, btn.dataset.key === "full");
        });
        toolbar._dimLabel.textContent = "Full viewport";
        currentPreset = null;
    }

    function toggle() {
        if (isActive) {
            // Hide toolbar & overlay
            if (toolbar) toolbar.style.display = "none";
            if (overlay) overlay.style.display = "none";
            fab.style.background = "#2b2d31";
            isActive = false;
        } else {
            // Show toolbar
            if (!toolbar) createToolbar();
            toolbar.style.display = "flex";
            fab.style.background = "#fbb931";
            fab.style.color = "#1e1f20";
            isActive = true;
        }
    }

    // --- Keyboard shortcuts ---
    document.addEventListener("keydown", function (e) {
        // Ctrl+Shift+B to toggle
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
            e.preventDefault();
            toggle();
            return;
        }
        // 1-4 when toolbar is active and not focused on input
        if (!isActive || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        var idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= 4) {
            activatePreset(PRESETS[idx - 1]);
        }
        if (e.key === "0") deactivatePreview();
    });

    // --- Don't initialize if we're inside the preview iframe ---
    if (new URLSearchParams(window.location.search).get("_bp_child") === "1") return;

    // --- Init ---
    createFAB();

    // Auto-launch at Mobile preset on load
    setTimeout(function () {
        toggle();
        activatePreset(PRESETS[0]);
    }, 100);
})();
