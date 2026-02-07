// This script is intended to be used in the browser.
// It is not intended to be used in node.
(function applyWireframeMode() {
    console.log("Initializing Wireframe Normalizer...");

    // --- PART A: INJECT CSS STYLES ---
    const cssStyles = `
        /* FORCE GLOBAL MONOSPACE & METRICS */
        * {
            font-family: "Courier New", Courier, monospace !important;
            font-size: 12px !important;
            font-weight: normal !important; /* Normalize weight to prevent random bolding */
            color: #000000 !important; /* Force all text to black */
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
            font-weight: bold !important; /* Only buttons/links get bold weight */
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
    styleSheet.type = "text/css";
    styleSheet.innerText = cssStyles;
    document.head.appendChild(styleSheet);


    // --- PART B: NORMALIZE DOM CONTENT ---

    // 1. REVEAL ACCESSIBILITY LABELS (ICON BUTTONS)
    const interactives = document.querySelectorAll('a, button, [role="button"]');
    interactives.forEach(el => {
        if (el.innerText.trim() === '') {
            const label = el.getAttribute('aria-label') || el.getAttribute('title');
            if (label) {
                el.innerText = label; 
                el.style.display = 'inline-block';
                el.style.width = 'auto';
                el.style.height = 'auto';
            }
        }
    });

    // 2. REPLACE MEDIA WITH INTELLIGENT PLACEHOLDERS
    const mediaElements = document.querySelectorAll('img, svg, video, canvas');
    mediaElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return;

        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: ${rect.width}px;
            height: ${rect.height}px;
            background: #f0f0f0;
            color: #000;
            font-family: monospace;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
            box-sizing: border-box;
        `;

        let altText = el.getAttribute('alt') || 
                      el.getAttribute('title') || 
                      el.getAttribute('aria-label');

        if (!altText && el.tagName.toLowerCase() === 'svg') {
            const titleEl = el.querySelector('title');
            if (titleEl) altText = titleEl.textContent;
        }

        if (rect.width <= 50 && rect.height <= 50) {
            placeholder.style.border = '1px solid #333';
            placeholder.style.fontSize = '8px';
            placeholder.style.padding = '0';
            const iconLabel = altText ? altText.substring(0, 8) : "ICON";
            placeholder.innerText = `[${iconLabel}]`;
        } else {
            placeholder.style.border = '2px solid #000';
            placeholder.style.fontSize = '10px';
            placeholder.style.padding = '2px';
            placeholder.style.wordBreak = 'break-word';
            const imgLabel = altText ? altText : "IMAGE";
            placeholder.innerText = `[${imgLabel}]`;
        }

        if(el.parentNode) {
            el.parentNode.replaceChild(placeholder, el);
        }
    });

    // 3. TAG INTERACTIVE ELEMENTS (Assign ID only, do not modify text)
    // We attribute the ID here, but visual rendering happens in the Paint phase.
    window.refCounter = (window.refCounter || 0) + 1;
    const allInteractives = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');
    
    allInteractives.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        // Skip hidden elements
        if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') return;
        
        // Assign Unique ID
        const rid = refCounter++;
        el.setAttribute('data-ref-id', rid);
    });

    // 4. CONVERT BACKGROUND IMAGES & STRIP COLORS
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const hasBgImage = style.backgroundImage !== 'none' && style.backgroundImage !== '';
        const hasBgColor = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
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

    console.log("Normalization Complete.");

    // --- PART C: WIREFRAME STRING GENERATOR (for agent consumption) ---
    function generateWireframeString() {
        // 1. GRID CONSTANTS (Matched to CSS Normalizer)
        const CHAR_W = 6; // 12px Courier New (~0.6 aspect ratio)
        const CHAR_H = 18;  // 18px Line Height

        const gridWidth = Math.ceil(window.innerWidth / CHAR_W);
        const gridHeight = Math.ceil(window.innerHeight / CHAR_H);
        const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(" "));

        function writeToGrid(x, y, str) {
            if (y < 0 || y >= gridHeight) return;
            for (let i = 0; i < str.length; i++) {
                const curX = x + i;
                if (curX >= 0 && curX < gridWidth) {
                    grid[y][curX] = str[i];
                }
            }
        }

        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || rect.width === 0 || rect.height === 0) {
                return;
            }

            const x = Math.floor(rect.left / CHAR_W);
            const y = Math.floor(rect.top / CHAR_H);
            let w = Math.ceil(rect.width / CHAR_W);
            const h = Math.ceil(rect.height / CHAR_H);

            const refId = el.getAttribute('data-ref-id');
            const refLabel = refId ? '[' + refId + ']' : '';

            if (refLabel) {
                w += refLabel.length + 1;
            }

            const isInteractive = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
                                  (el.tagName === 'A' && style.borderWidth !== '0px') ||
                                  el.getAttribute('role') === 'button';

            const elText = el.innerText || el.textContent || '';
            const isImagePlaceholder = elText.indexOf('[IMG') !== -1 || elText.indexOf('[X]') !== -1;
            const isBgContainer = el.hasAttribute('data-bg-image');

            if (isInteractive || isImagePlaceholder || isBgContainer) {
                const borderCharH = '-';
                const borderCharV = '|';
                const cornerChar = '+';

                writeToGrid(x, y, cornerChar + borderCharH.repeat(Math.max(0, w - 2)) + cornerChar);
                for (let i = 1; i < h - 1; i++) {
                    writeToGrid(x, y + i, borderCharV);
                    writeToGrid(x + w - 1, y + i, borderCharV);
                }
                writeToGrid(x, y + h - 1, cornerChar + borderCharH.repeat(Math.max(0, w - 2)) + cornerChar);
            }

            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    const text = node.textContent.replace(/\s+/g, ' ').trim();
                    let textX = x + 1;
                    let textY = y;

                    if (isInteractive || isImagePlaceholder) {
                        textX = x + Math.max(1, Math.floor((w - text.length) / 2));
                        textY = y + Math.floor((h - 1) / 2);
                    }

                    writeToGrid(textX, textY, text);
                }
            });

            if (refLabel && isInteractive && ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) === -1) {
                const labelX = x + w - refLabel.length - 1;
                const labelY = y + Math.floor((h - 1) / 2);
                writeToGrid(labelX, labelY, refLabel);
            }

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                var val = el.getAttribute('value') || '';
                if (refLabel) val += ' ' + refLabel;
                if (val) {
                    writeToGrid(x + 1, y + Math.floor((h - 1) / 2), val);
                }
            }

            if (el.tagName === 'SELECT') {
                writeToGrid(x + w - 2, y + Math.floor((h - 1) / 2), 'v');
                if (refLabel) {
                    writeToGrid(x + w - 3 - refLabel.length, y + Math.floor((h - 1) / 2), refLabel);
                }
            }
        });

        return grid.map(function(row) { return row.join(''); }).join('\n');
    }

    window.generateWireframeString = generateWireframeString;
})();