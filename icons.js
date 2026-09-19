// Stylized, original icon marks representing each tool — not reproductions of official logos.
const TOOL_ICONS = {
  blender: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="24" r="15" fill="currentColor" opacity="0.18"/>
    <path d="M32 10c-8 0-14 6.5-14 14 0 6 3.8 11 9.2 13.2L24 50l8-6 8 6-3.2-12.8C42.2 35 46 30 46 24c0-7.5-6-14-14-14z" fill="currentColor"/>
    <circle cx="32" cy="22" r="5.5" fill="var(--bg-card)"/>
  </svg>`,
  godot: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="44" height="44" rx="14" fill="currentColor" opacity="0.18"/>
    <circle cx="24" cy="28" r="6" fill="currentColor"/>
    <circle cx="40" cy="28" r="6" fill="currentColor"/>
    <circle cx="24" cy="28" r="2.2" fill="var(--bg-card)"/>
    <circle cx="40" cy="28" r="2.2" fill="var(--bg-card)"/>
    <path d="M20 42c3-4 21-4 24 0" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M16 16l4 6M48 16l-4 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  unity: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8l20 11.5v23L32 54 12 42.5v-23L32 8z" fill="currentColor" opacity="0.15"/>
    <path d="M32 8l9 13-9 5-9-5 9-13z" fill="currentColor"/>
    <path d="M12 19.5L25 25l-4 10-9-3.5v-12z" fill="currentColor" opacity="0.75"/>
    <path d="M52 19.5L39 25l4 10 9-3.5v-12z" fill="currentColor" opacity="0.75"/>
    <path d="M21 35l4-10 7 4-2 11-9-5z" fill="currentColor" opacity="0.55"/>
    <path d="M43 35l-4-10-7 4 2 11 9-5z" fill="currentColor" opacity="0.55"/>
    <path d="M32 54l-9-11.5 9-5 9 5-9 11.5z" fill="currentColor"/>
  </svg>`,
  aseprite: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="44" height="44" rx="6" fill="currentColor" opacity="0.15"/>
    <rect x="10" y="10" width="11" height="11" fill="currentColor"/>
    <rect x="32" y="10" width="11" height="11" fill="currentColor" opacity="0.85"/>
    <rect x="21" y="21" width="11" height="11" fill="currentColor" opacity="0.6"/>
    <rect x="43" y="21" width="11" height="11" fill="currentColor"/>
    <rect x="10" y="32" width="11" height="11" fill="currentColor" opacity="0.85"/>
    <rect x="32" y="32" width="11" height="11" fill="currentColor" opacity="0.6"/>
    <rect x="21" y="43" width="11" height="11" fill="currentColor"/>
    <rect x="43" y="43" width="11" height="11" fill="currentColor" opacity="0.85"/>
  </svg>`,
  unreal: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" fill="currentColor" opacity="0.15"/>
    <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M14 36c3-10 6-16 9-16 2.5 0 3 5 4 12 1-9 2-14 5-14s4 5 5 14c1-7 1.5-12 4-12 3 0 6 6 9 16" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  spine: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="12" r="6" fill="currentColor"/>
    <path d="M32 18v28" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="22" r="2.4" fill="var(--bg-card)"/>
    <circle cx="32" cy="30" r="2.4" fill="var(--bg-card)"/>
    <circle cx="32" cy="38" r="2.4" fill="var(--bg-card)"/>
    <path d="M32 24l-12 8M32 24l12 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 46l-10 10M32 46l10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  tiled: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="21" height="21" rx="3" fill="currentColor"/>
    <rect x="35" y="8" width="21" height="21" rx="3" fill="currentColor" opacity="0.45"/>
    <rect x="8" y="35" width="21" height="21" rx="3" fill="currentColor" opacity="0.45"/>
    <rect x="35" y="35" width="21" height="21" rx="3" fill="currentColor"/>
    <path d="M18.5 14v14M14 18.5h9M45.5 41v14M41 45.5h9" stroke="var(--bg-card)" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  krita: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 50L42 12c1.5-1.9 4.4-1.9 5.7.1 1 1.6.7 3.7-.8 5L20 50H12z" fill="currentColor"/>
    <circle cx="46" cy="15" r="5" fill="currentColor" opacity="0.5"/>
    <path d="M12 50h34" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  construct3: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M46 16a18 18 0 100 32" stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M40 24l6 8-6 8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  audacity: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 32h6l4-12 6 24 6-30 6 30 6-24 4 12h10" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`,
  figma: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 8h10a9 9 0 010 18H26V8z" fill="currentColor"/>
    <path d="M17 26h9a9 9 0 010 18h-9a9 9 0 010-18z" fill="currentColor" opacity="0.7"/>
    <circle cx="26" cy="53" r="9" fill="currentColor" opacity="0.55"/>
    <path d="M36 26a9 9 0 100 18 9 9 0 000-18z" fill="currentColor" opacity="0.85"/>
    <path d="M17 8h9v18h-9a9 9 0 010-18z" fill="currentColor" opacity="0.4"/>
  </svg>`
};

const TOOL_META = {
  blender: { label: "Blender", tagline: "Model something finished, not just a demo scene.", accent: "#ea8123", downloadUrl: "https://www.blender.org/download/", downloadNote: "Free" },
  godot: { label: "Godot", tagline: "Every entry ends in a real, playable game.", accent: "#5fa9e0", downloadUrl: "https://godotengine.org/download", downloadNote: "Free" },
  unity: { label: "Unity", tagline: "Complete games, engine current to Unity 6.", accent: "#9a9dff", downloadUrl: "https://unity.com/download", downloadNote: "Free tier" },
  unreal: { label: "Unreal", tagline: "3D-first, genuinely finished Unreal 5 games.", accent: "#6f7dfc", downloadUrl: "https://www.unrealengine.com/en-US/download", downloadNote: "Free" },
  aseprite: { label: "Aseprite", tagline: "Finished sprites, animations, and tilesets.", accent: "#ff6f9c", downloadUrl: "https://www.aseprite.org/", downloadNote: "Paid (or free self-build)" },
  spine: { label: "Spine", tagline: "Rigged, skinned, genuinely animated 2D characters.", accent: "#7ee081", downloadUrl: "https://esotericsoftware.com/spine-download", downloadNote: "Free trial" },
  tiled: { label: "Tiled", tagline: "Real, exported levels — not just tile-painting demos.", accent: "#e0a95f", downloadUrl: "https://www.mapeditor.org/download.html", downloadNote: "Free" },
  krita: { label: "Krita", tagline: "Finished paintings, not abandoned sketches.", accent: "#f06292", downloadUrl: "https://krita.org/en/download/krita-desktop/", downloadNote: "Free" },
  construct3: { label: "Construct 3", tagline: "No-code 2D games that actually have a win state.", accent: "#5fd0e0", downloadUrl: "https://www.construct.net/en/make-games/construct-3", downloadNote: "Free tier" },
  audacity: { label: "Audacity", tagline: "Finished, exported audio — SFX, voice, and mixes.", accent: "#c4a5e0", downloadUrl: "https://www.audacityteam.org/download/", downloadNote: "Free" },
  figma: { label: "Figma", tagline: "Real, finished game UI and HUD designs.", accent: "#5fd97a", downloadUrl: "https://www.figma.com/downloads/", downloadNote: "Free tier" }
};
