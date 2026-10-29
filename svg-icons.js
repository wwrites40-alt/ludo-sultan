/* ==========================================================================
   LUDO SULTAN — SVG ICONS REPOSITORY (`svg-icons.js`)
   ========================================================================== */

const ArenaSvgIcons = {
  // 1. Forest Arena (50 Coins) - Leaf / Forest Shield
  "forest-arena": `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#81c784"/>
          <stop offset="100%" stop-color="#1b5e20"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="rgba(27,94,32,0.4)" stroke="#72d572" stroke-width="3"/>
      <path d="M50 20 C30 35, 30 65, 50 85 C70 65, 70 35, 50 20 Z" fill="url(#forestGrad)" stroke="#a5d6a7" stroke-width="2"/>
      <path d="M50 30 L50 75 M50 45 L38 55 M50 55 L62 65" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,

  // 2. Royal Palace (100 Coins) - Golden Crown
  "royal-palace": `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffde7"/>
          <stop offset="50%" stop-color="#ffd54f"/>
          <stop offset="100%" stop-color="#ff8f00"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="rgba(57,32,95,0.4)" stroke="#e5c76b" stroke-width="3"/>
      <path d="M25 65 L30 35 L50 50 L70 35 L75 65 Z" fill="url(#goldGrad)" stroke="#ffe082" stroke-width="2" stroke-linejoin="round"/>
      <rect x="23" y="68" width="54" height="8" rx="3" fill="url(#goldGrad)"/>
      <circle cx="30" cy="32" r="4" fill="#e53935"/><circle cx="50" cy="45" r="4" fill="#1e88e5"/><circle cx="70" cy="32" r="4" fill="#43a047"/>
    </svg>
  `,

  // 3. Desert Dangers (200 Coins) - Pyramid & Sun
  "desert-dangers": `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="desertSun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffcc80"/>
          <stop offset="100%" stop-color="#e65100"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="rgba(75,37,22,0.4)" stroke="#f2c078" stroke-width="3"/>
      <circle cx="50" cy="35" r="12" fill="url(#desertSun)"/>
      <polygon points="50,30 20,70 80,70" fill="url(#desertSun)" stroke="#ffe0b2" stroke-width="2"/>
      <polygon points="50,30 50,70 80,70" fill="#ffa726" opacity="0.6"/>
    </svg>
  `,

  // 4. Diamond Arena (500 Coins) - Glowing Crystal Diamond
  "diamond-arena": `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#80deea"/>
          <stop offset="100%" stop-color="#00838f"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="rgba(8,47,73,0.4)" stroke="#67e8f9" stroke-width="3"/>
      <polygon points="30,35 70,35 85,55 50,85 15,55" fill="url(#diamondGrad)" stroke="#b2ebf2" stroke-width="2"/>
      <polyline points="30,35 50,85 70,35" fill="none" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="30" y1="35" x2="70" y2="35" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="15" y1="55" x2="85" y2="55" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `,

  // 5. Ice Kingdom (1,000 Coins) - Snowflake Crystal
  "ice-kingdom": `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#1565c0"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="rgba(12,27,63,0.4)" stroke="#bfdbfe" stroke-width="3"/>
      <g stroke="url(#iceGrad)" stroke-width="3" stroke-linecap="round">
        <line x1="50" y1="20" x2="50" y2="80"/>
        <line x1="24" y1="35" x2="76" y2="65"/>
        <line x1="24" y1="65" x2="76" y2="35"/>
        <!-- Snowflake Details -->
        <polyline points="43,28 50,20 57,28"/>
        <polyline points="43,72 50,80 57,72"/>
      </g>
    </svg>
  `,

  // 6. Lava Fortress (2,500 Coins) - Magma
