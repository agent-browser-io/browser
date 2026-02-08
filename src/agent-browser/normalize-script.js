// This script is intended to be used in the browser.
// It is not intended to be used in node.
(function applyWireframeMode() {
    // --- PART A: INJECT CSS STYLES (idempotent) ---
    if (!document.getElementById("wf-normalize")) {
        const cssStyles = `
            /* FORCE GLOBAL MONOSPACE & METRICS */
            * {
                font-family: "Courier New", Courier, monospace !important;
                font-size: 12px !important;
                font-weight: normal !important;
                color: #000000 !important;
                line-height: 18px !important;
                letter-spacing: 0px !important;
                box-shadow: none !important;
                text-shadow: none !important;
                border-radius: 0 !important;
                transition: none !important;
            }

            /* HIGH CONTRAST THEME */
            body {
                background-color: #ffffff !important;
                color: #000000 !important;
            }

            /* STRUCTURAL OUTLINES */
            div, section, article, header, footer, nav, aside, main {
                border: 1px dotted #cccccc !important;
            }

            /* KILL PSEUDO-ELEMENT BACKGROUNDS */
            *::before, *::after {
                background-image: none !important;
                background-color: transparent !important;
                border: none !important;
            }

            /* INTERACTIVE ELEMENTS */
            a, button, input[type="submit"], input[type="button"], [role="button"] {
                border: 2px solid #000000 !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                text-transform: uppercase !important;
                text-decoration: none !important;
                font-weight: bold !important;
            }

            /* FORM INPUTS */
            input, textarea, select {
                border: 1px solid #000000 !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                font-family: monospace !important;
            }

            /* HIDE DECORATIVE MEDIA */
            img, video, canvas, svg {
                opacity: 0.5 !important;
                filter: grayscale(100%) !important;
                border: 1px dashed #000 !important;
            }

            /* BACKGROUND IMAGE INDICATORS */
            [data-bg-image="true"] {
                background-color: #f4f4f4 !important;
                border: 1px dashed #555555 !important;
                position: relative !important;
            }
            [data-bg-image="true"]::before {
                content: "[ BG IMAGE ]";
                position: absolute;
                top: 0; right: 0;
                background: #000000; color: #ffffff;
                font-size: 10px !important;
                padding: 2px 4px;
                opacity: 0.8;
                z-index: 9999;
                pointer-events: none;
                font-weight: normal !important;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = "wf-normalize";
        styleSheet.type = "text/css";
        styleSheet.innerText = cssStyles;
        document.head.appendChild(styleSheet);
    }

    // --- PART B: NORMALIZE DOM CONTENT (idempotent) ---
    if (!document.body) return; // page not ready

    // Helper: check if element is the top-most (not behind an overlay) at its center
    function isElementVisible(el) {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        if (cx < 0 || cy < 0 || cx >= window.innerWidth || cy >= window.innerHeight) return false;
        var topEl = document.elementFromPoint(cx, cy);
        if (!topEl) return false;
        return el.contains(topEl) || topEl.contains(el);
    }

    // Remove old ref IDs and reset counter
    document.querySelectorAll("[data-ref-id]").forEach(function(el) {
        el.removeAttribute("data-ref-id");
    });
    var refCounter = 1;

    // Only run DOM mutations (media replacement, accessibility labels, bg stripping) once
    if (!document.body.hasAttribute("data-wf-normalized")) {
        document.body.setAttribute("data-wf-normalized", "true");

        // 1. REVEAL ACCESSIBILITY LABELS (ICON BUTTONS)
        var interactives = document.querySelectorAll('a, button, [role="button"]');
        interactives.forEach(function(el) {
            if (el.innerText.trim() === '') {
                var label = el.getAttribute('aria-label') || el.getAttribute('title');
                // Also check child elements for hints (e.g. HN vote arrows: <a><div title="upvote"></a>)
                if (!label) {
                    var hintEl = el.querySelector('[aria-label], [title]');
                    if (hintEl) label = hintEl.getAttribute('aria-label') || hintEl.getAttribute('title');
                }
                if (label) {
                    el.innerText = label;
                    el.style.display = 'inline-block';
                    el.style.width = 'auto';
                    el.style.height = 'auto';
                }
            }
        });

        // 2. REPLACE MEDIA WITH INTELLIGENT PLACEHOLDERS
        var mediaElements = document.querySelectorAll('img, svg, video, canvas');
        mediaElements.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) return;

            var placeholder = document.createElement('div');
            placeholder.style.cssText =
                'width:' + rect.width + 'px;' +
                'height:' + rect.height + 'px;' +
                'background:#f0f0f0;color:#000;font-family:monospace;font-weight:bold;' +
                'display:flex;align-items:center;justify-content:center;text-align:center;' +
                'overflow:hidden;box-sizing:border-box;';

            var altText = el.getAttribute('alt') ||
                          el.getAttribute('title') ||
                          el.getAttribute('aria-label');

            if (!altText && el.tagName.toLowerCase() === 'svg') {
                var titleEl = el.querySelector('title');
                if (titleEl) altText = titleEl.textContent;
            }

            if (rect.width <= 50 && rect.height <= 50) {
                placeholder.style.border = '1px solid #333';
                placeholder.style.fontSize = '8px';
                placeholder.style.padding = '0';
                // Use short label for tiny icons to avoid overflow
                if (rect.width <= 20 || rect.height <= 20) {
                    placeholder.innerText = altText ? altText.substring(0, 1) : '*';
                } else {
                    var iconLabel = altText ? altText.substring(0, 8) : "ICON";
                    placeholder.innerText = '[' + iconLabel + ']';
                }
            } else {
                placeholder.style.border = '2px solid #000';
                placeholder.style.fontSize = '10px';
                placeholder.style.padding = '2px';
                placeholder.style.wordBreak = 'break-word';
                var imgLabel = altText ? altText : "IMAGE";
                placeholder.innerText = '[' + imgLabel + ']';
            }

            if (el.parentNode) {
                el.parentNode.replaceChild(placeholder, el);
            }
        });

        // 3. CONVERT BACKGROUND IMAGES & STRIP COLORS
        var allElements = document.querySelectorAll('*');
        allElements.forEach(function(el) {
            var style = window.getComputedStyle(el);
            var hasBgImage = style.backgroundImage !== 'none' && style.backgroundImage !== '';
            var hasBgColor = style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                             style.backgroundColor !== 'transparent' &&
                             style.backgroundColor !== 'rgb(255, 255, 255)';

            if (hasBgImage) {
                el.style.backgroundImage = 'none';
                el.setAttribute('data-bg-image', 'true');
            }

            if (hasBgColor) {
                el.style.backgroundColor = '#ffffff';
            }
        });
    }

    // 4. REMOVE TRANSPARENT OVERLAY BACKDROPS (run every time — new overlays can appear)
    // Full-viewport high z-index divs with no meaningful text are just backdrop overlays
    // that block elementFromPoint for content behind them
    var overlayDivs = document.querySelectorAll('div');
    overlayDivs.forEach(function(el) {
        var style = window.getComputedStyle(el);
        var z = parseInt(style.zIndex) || 0;
        if (z < 100 || style.display === 'none') return;
        var rect = el.getBoundingClientRect();
        if (rect.width < window.innerWidth * 0.9 || rect.height < window.innerHeight * 0.9) return;
        var text = (el.innerText || '').trim();
        if (text.length < 5) {
            el.style.display = 'none';
        }
    });

    // Overflow buffer: capture high-z-index elements pushed below viewport by CSS normalization
    var OVERFLOW_BUFFER = 200;
    var captureHeight = window.innerHeight + OVERFLOW_BUFFER;

    // 5. TAG INTERACTIVE ELEMENTS (always re-run since we cleared ref IDs)
    // Only tag elements visible, in viewport (+ overflow buffer), and not behind overlays
    function tagIfVisible(el) {
        if (el.hasAttribute('data-ref-id')) return; // already tagged
        var rect = el.getBoundingClientRect();
        var style = window.getComputedStyle(el);
        if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') return;
        if (rect.bottom < 0 || rect.top >= captureHeight || rect.right < 0 || rect.left >= window.innerWidth) return;
        // Elements in overflow zone (below viewport): can't use elementFromPoint, just tag them
        if (rect.top >= window.innerHeight) {
            el.setAttribute('data-ref-id', String(refCounter++));
            return;
        }
        if (!isElementVisible(el)) return;
        el.setAttribute('data-ref-id', String(refCounter++));
    }

    // Pass 1: semantic interactive elements
    var allInteractives = document.querySelectorAll('a, button, input, textarea, select, [role="button"], [onclick], [tabindex="0"]');
    allInteractives.forEach(tagIfVisible);

    // Pass 2: non-semantic clickable elements (divs/spans with cursor:pointer and text)
    // This catches sites that use <div> as buttons without proper ARIA roles
    var potentialClickables = document.querySelectorAll('div, span');
    potentialClickables.forEach(function(el) {
        if (el.hasAttribute('data-ref-id')) return;
        // Skip if already inside a tagged interactive element
        if (el.closest && el.closest('[data-ref-id]')) return;
        var style = window.getComputedStyle(el);
        if (style.cursor !== 'pointer') return;
        // Must have direct text content (not just children with text)
        var hasDirectText = false;
        for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) {
                hasDirectText = true;
                break;
            }
        }
        if (!hasDirectText) return;
        tagIfVisible(el);
    });

    console.log("Normalization Complete.");

    // --- PART C: WIREFRAME STRING GENERATOR ---
    function generateWireframeString() {
        // 1. Measure CHAR_W dynamically
        var probe = document.createElement('span');
        probe.style.cssText = 'font-family:"Courier New",Courier,monospace;font-size:12px;line-height:18px;letter-spacing:0px;position:absolute;top:-9999px;left:-9999px;white-space:pre;visibility:hidden;';
        probe.textContent = 'MMMMMMMMMM';
        document.body.appendChild(probe);
        var CHAR_W = probe.getBoundingClientRect().width / 10;
        document.body.removeChild(probe);
        if (CHAR_W <= 0) CHAR_W = 7.2; // fallback

        var CHAR_H = 18;

        // 2. Create grid (includes overflow buffer for elements pushed below viewport)
        var OVERFLOW_BUFFER_C = 200;
        var captureHeightC = window.innerHeight + OVERFLOW_BUFFER_C;
        var gridWidth = Math.ceil(window.innerWidth / CHAR_W);
        var gridHeight = Math.ceil(captureHeightC / CHAR_H);
        var grid = [];
        for (var r = 0; r < gridHeight; r++) {
            var row = [];
            for (var c = 0; c < gridWidth; c++) {
                row.push(' ');
            }
            grid.push(row);
        }

        function writeToGrid(x, y, str) {
            if (y < 0 || y >= gridHeight) return;
            for (var i = 0; i < str.length; i++) {
                var curX = x + i;
                if (curX >= 0 && curX < gridWidth) {
                    grid[y][curX] = str[i];
                }
            }
        }

        // 3. Draw borders only for block-level interactive elements (buttons, form controls)
        //    Skip inline links — they just get ref labels.
        var refElements = document.querySelectorAll('[data-ref-id]');
        refElements.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            var style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return;
            // Skip elements outside capture area
            if (rect.bottom < 0 || rect.top >= captureHeightC || rect.right < 0 || rect.left >= window.innerWidth) return;

            // Only draw borders for buttons, form elements, and block-level role=button
            var tag = el.tagName;
            var isFormEl = (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
            var isBlockButton = (el.getAttribute('role') === 'button' && style.display !== 'inline');
            if (!isFormEl && !isBlockButton) return;

            var x = Math.floor(rect.left / CHAR_W);
            var y = Math.floor(rect.top / CHAR_H);
            var w = Math.max(2, Math.ceil(rect.width / CHAR_W));
            var h = Math.max(2, Math.ceil(rect.height / CHAR_H));

            // Top border
            writeToGrid(x, y, '+' + repeat('-', Math.max(0, w - 2)) + '+');
            // Side borders
            for (var i = 1; i < h - 1; i++) {
                writeToGrid(x, y + i, '|');
                writeToGrid(x + w - 1, y + i, '|');
            }
            // Bottom border
            if (h > 1) {
                writeToGrid(x, y + h - 1, '+' + repeat('-', Math.max(0, w - 2)) + '+');
            }
        });

        // Helper: check if element is the top-most at a given point
        function isVisibleAt(el, px, py) {
            if (px < 0 || py < 0 || px >= window.innerWidth) return false;
            // Overflow zone: elementFromPoint doesn't work below viewport, assume visible
            if (py >= window.innerHeight) return py < captureHeightC;
            var topEl = document.elementFromPoint(px, py);
            if (!topEl) return false;
            return el.contains(topEl) || topEl.contains(el);
        }

        // 4. Render text via TreeWalker (text only, no labels yet)
        var labeledRefs = {}; // refId -> {row, col} where the element's first text starts
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var textNode;
        while ((textNode = walker.nextNode())) {
            var parent = textNode.parentElement;
            if (!parent) continue;

            // Skip script/style
            var tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') continue;

            // Skip invisible parents
            var pStyle = window.getComputedStyle(parent);
            if (pStyle.display === 'none' || pStyle.visibility === 'hidden' || pStyle.opacity === '0') continue;

            // Skip empty text
            var rawText = textNode.textContent;
            if (!rawText || !rawText.trim()) continue;

            // Skip form elements (handled separately)
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'OPTION') continue;

            // Collapse whitespace
            var collapsed = rawText.replace(/\s+/g, ' ').trim();
            if (!collapsed) continue;

            // Track first text position for ref label insertion
            var refAncestor = parent.closest ? parent.closest('[data-ref-id]') : null;

            // Use Range + getClientRects for accurate per-line positioning
            var range = document.createRange();
            range.selectNodeContents(textNode);
            var rects = range.getClientRects();

            if (rects.length === 0) continue;

            var charOffset = 0;
            var firstWritten = false;
            for (var ri = 0; ri < rects.length; ri++) {
                var rr = rects[ri];
                if (rr.width < 1 || rr.height < 1) continue;

                // Skip rects outside capture area or covered by overlays
                if (rr.bottom < 0 || rr.top >= captureHeightC || rr.right < 0 || rr.left >= window.innerWidth) {
                    charOffset += Math.max(1, Math.ceil(rr.width / CHAR_W));
                    continue;
                }
                var rcx = rr.left + rr.width / 2;
                var rcy = rr.top + rr.height / 2;
                if (!isVisibleAt(parent, rcx, rcy)) {
                    charOffset += Math.max(1, Math.ceil(rr.width / CHAR_W));
                    continue;
                }

                var gx = Math.floor(rr.left / CHAR_W);
                var gy = Math.floor(rr.top / CHAR_H);
                var charsInLine = Math.max(1, Math.ceil(rr.width / CHAR_W));
                // Cap to actual remaining text length
                var remaining = collapsed.length - charOffset;
                if (charsInLine > remaining) charsInLine = remaining;
                var slice = collapsed.substring(charOffset, charOffset + charsInLine);
                if (slice) {
                    writeToGrid(gx, gy, slice);

                    // Record insertion point for this ref's label
                    if (!firstWritten && refAncestor) {
                        var rid = refAncestor.getAttribute('data-ref-id');
                        if (!labeledRefs[rid]) {
                            labeledRefs[rid] = {row: gy, col: gx};
                        }
                        firstWritten = true;
                    }
                }
                charOffset += charsInLine;
            }
        }

        // 5. Handle form inputs
        var formEls = document.querySelectorAll('input, textarea, select');
        formEls.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            var style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return;

            var x = Math.floor(rect.left / CHAR_W);
            var y = Math.floor(rect.top / CHAR_H);
            var w = Math.max(2, Math.ceil(rect.width / CHAR_W));
            var h = Math.max(2, Math.ceil(rect.height / CHAR_H));
            var midY = y + Math.floor((h - 1) / 2);
            var refId = el.getAttribute('data-ref-id');

            if (el.tagName === 'SELECT') {
                var selectedText = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : '';
                var selectContent = selectedText.substring(0, Math.max(0, w - 4));
                if (selectContent) writeToGrid(x + 1, midY, selectContent);
                writeToGrid(x + w - 2, midY, 'v');
            } else {
                var val = el.value || el.getAttribute('placeholder') || '';
                if (val) writeToGrid(x + 1, midY, val);
            }

            // Track form element position for label insertion
            if (refId && !labeledRefs[refId]) {
                labeledRefs[refId] = {row: midY, col: x};
            }
        });

        // Also track ref elements with no text at all (empty buttons, icons)
        refElements.forEach(function(el) {
            var refId = el.getAttribute('data-ref-id');
            if (labeledRefs[refId]) return;
            var rect = el.getBoundingClientRect();
            var style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) return;
            labeledRefs[refId] = {row: Math.floor(rect.top / CHAR_H), col: Math.floor(rect.left / CHAR_W)};
        });

        // 6. Insert ref labels by splicing into rows (never overwrites text)
        // Collect all labels per row, sorted right-to-left so insertions don't shift later positions
        var rowInsertions = {}; // row -> [{col, label}]
        refElements.forEach(function(el) {
            var refId = el.getAttribute('data-ref-id');
            if (!refId) return;
            var pos = labeledRefs[refId];
            if (!pos) return;
            var label = '[' + refId + ']';
            if (!rowInsertions[pos.row]) rowInsertions[pos.row] = [];
            rowInsertions[pos.row].push({col: pos.col, label: label});
        });

        // For each row with insertions, splice labels into the row string
        for (var rowIdx in rowInsertions) {
            var r = parseInt(rowIdx, 10);
            if (r < 0 || r >= gridHeight) continue;
            var inserts = rowInsertions[r];
            // Sort by column descending so we insert right-to-left (preserves earlier positions)
            inserts.sort(function(a, b) { return b.col - a.col; });
            // Convert row to string, splice in labels, write back
            var rowStr = grid[r].join('');
            for (var ii = 0; ii < inserts.length; ii++) {
                var ins = inserts[ii];
                var c = Math.max(0, Math.min(ins.col, rowStr.length));
                // Avoid splitting inside a [...] bracket sequence — shift to before the '['
                var openBracket = rowStr.lastIndexOf('[', c);
                if (openBracket >= 0) {
                    var closeBracket = rowStr.indexOf(']', openBracket);
                    if (closeBracket >= c) {
                        // Insertion point is inside [..], shift to before the [
                        c = openBracket;
                    }
                }
                rowStr = rowStr.substring(0, c) + ins.label + rowStr.substring(c);
            }
            // Write back to grid as variable-width row (will be joined as string in step 7)
            grid[r] = rowStr.split('');
        }

        // 7. Trim output
        var lines = [];
        for (var r = 0; r < gridHeight; r++) {
            lines.push(grid[r].join('').replace(/\s+$/, ''));
        }
        // Drop trailing empty rows
        while (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        return lines.join('\n');
    }

    function repeat(ch, count) {
        var s = '';
        for (var i = 0; i < count; i++) s += ch;
        return s;
    }

    window.generateWireframeString = generateWireframeString;
})();
