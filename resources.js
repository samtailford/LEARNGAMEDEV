// Curated meta-resources: text-based tutorial hubs and free asset sites.
// These are hand-picked known-good hubs, not individually vetted single tutorials.

const TEXT_HUBS = {
  blender: [
    { name: "Blender Manual", desc: "Official written documentation and workflows, maintained by the Blender Foundation.", url: "https://docs.blender.org/manual/en/latest/" },
    { name: "BlenderNation", desc: "Long-running news site with a steady stream of written tutorial roundups.", url: "https://www.blendernation.com/" },
    { name: "Blender Artists Forum - Tutorials", desc: "Community forum section with written walkthroughs and critique threads.", url: "https://blenderartists.org/c/tutorials-tips-and-tricks/13" }
  ],
  godot: [
    { name: "Godot Docs - Step by Step", desc: "Official written, illustrated tutorial series maintained by the Godot team.", url: "https://docs.godotengine.org/en/stable/getting_started/step_by_step/index.html" },
    { name: "GDQuest Tutorials", desc: "Written tutorials and guides alongside GDQuest's video library.", url: "https://www.gdquest.com/tutorial/" },
    { name: "Awesome Godot", desc: "Community-curated GitHub list of tools, add-ons, and learning resources.", url: "https://github.com/godotengine/awesome-godot" }
  ],
  unity: [
    { name: "Unity Manual", desc: "Official written documentation covering every engine system.", url: "https://docs.unity3d.com/Manual/index.html" },
    { name: "Unity Learn", desc: "Official mixed video/written courses and project pages.", url: "https://learn.unity.com/" },
    { name: "Catlike Coding", desc: "Deep, code-first written tutorials on C# and shaders by Jasper Flick — a longtime community favorite.", url: "https://catlikecoding.com/unity/tutorials/" }
  ],
  unreal: [
    { name: "Epic Developer Community - Learning", desc: "Official written documentation-style tutorials from Epic.", url: "https://dev.epicgames.com/documentation/unreal-engine" },
    { name: "Tom Looman", desc: "In-depth written C++ and optimization tutorials from a former Epic engineer.", url: "https://tomlooman.com/" },
    { name: "Unreal Directive", desc: "Community-submitted articles, tools, and written guides.", url: "https://unrealdirective.com/" }
  ],
  aseprite: [
    { name: "Aseprite Docs", desc: "Official written documentation covering every tool and feature.", url: "https://www.aseprite.org/docs/" },
    { name: "Lospec Pixel Art Tutorials", desc: "Community-written pixel art tutorials and technique guides.", url: "https://lospec.com/pixel-art-tutorials" },
    { name: "Aseprite Community Forum", desc: "Written walkthroughs and critique threads from the official community.", url: "https://community.aseprite.org/" }
  ],
  spine: [
    { name: "Spine User Guide", desc: "Official written documentation covering rigging, meshes, animation, and export.", url: "https://en.esotericsoftware.com/spine-user-guide" },
    { name: "Spine Academy", desc: "Esoteric Software's official structured learning path for Spine.", url: "https://en.esotericsoftware.com/spine-academy" },
    { name: "Spine Forum", desc: "Community written Q&A, workflow tips, and troubleshooting threads.", url: "https://en.esotericsoftware.com/forum/" }
  ],
  tiled: [
    { name: "Tiled Documentation", desc: "Official written manual covering maps, layers, tilesets, objects, and the scripting API.", url: "https://doc.mapeditor.org/" },
    { name: "mapeditor.org Blog", desc: "Written tutorials and release notes from Tiled's creator.", url: "https://www.mapeditor.org/" },
    { name: "GameFromScratch Tiled Series", desc: "Long-running written companion to GameFromScratch's Tiled tutorial series.", url: "https://gamefromscratch.com/tiled-map-editor-tutorial-series/" }
  ],
  krita: [
    { name: "Krita Manual", desc: "Official written documentation covering every tool and workflow.", url: "https://docs.krita.org/en/" },
    { name: "Krita Manual - Tutorials and How-tos", desc: "Official written tutorial section within the Krita manual.", url: "https://docs.krita.org/en/tutorials.html" },
    { name: "Krita Artists Forum", desc: "Community written tutorials, critique, and technique threads.", url: "https://krita-artists.org/" }
  ],
  construct3: [
    { name: "Construct 3 Tutorials", desc: "Official written tutorial library covering every skill level.", url: "https://www.construct.net/en/tutorials/construct-3" },
    { name: "Construct 3 Manual", desc: "Official written documentation and reference for every engine feature.", url: "https://www.construct.net/en/make-games/manuals/construct-3" },
    { name: "Construct Community Forum", desc: "Written troubleshooting, showcases, and technique threads.", url: "https://www.construct.net/en/forum" }
  ],
  audacity: [
    { name: "Audacity Manual", desc: "Official written documentation covering every tool and effect.", url: "https://manual.audacityteam.org/" },
    { name: "Tutorials for Audacity", desc: "Official written tutorial section within the Audacity manual.", url: "https://manual.audacityteam.org/man/tutorials_for_audacity.html" },
    { name: "Audacity Forum", desc: "Community written troubleshooting and workflow threads.", url: "https://forum.audacityteam.org/" }
  ],
  figma: [
    { name: "Figma Learn - Help Center", desc: "Official written documentation and how-tos for every Figma feature.", url: "https://help.figma.com/hc/en-us" },
    { name: "Figma Design for Beginners", desc: "Official structured written course for learning Figma from scratch.", url: "https://help.figma.com/hc/en-us/sections/30880632542743-Figma-Design-for-beginners" },
    { name: "Figma Community", desc: "Community-shared files, UI kits, and written breakdowns of real designs.", url: "https://www.figma.com/community" }
  ]
};

const TEMPLATES = {
  godot: [
    { name: "Kenney Starter Kits", desc: "Free, CC0/MIT complete project templates: City Builder, 3D Platformer, FPS, Racing, Basic Scene — download and build on directly.", url: "https://kenney.nl/starter-kits" },
    { name: "Godot 2D RPG Template", desc: "MIT-licensed (verified) comprehensive top-down RPG template: character controller, inventory, save/load, dialogue, state machines, tilemap tools.", url: "https://github.com/theantihero/godot-2d-rpg" }
  ],
  unity: [
    { name: "Unity Learn - Project Templates", desc: "Official free Microgames (Platformer, Karting, FPS) you can mod as a starting point.", url: "https://learn.unity.com/project/2d-platformer-template" },
    { name: "FPS Microgame", desc: "Official, free, complete first-person shooter template from Unity — mod it directly via Creative Mods.", url: "https://learn.unity.com/project/fps-template" },
    { name: "Unity Asset Store - Templates", desc: "Browse and filter to free — official and community starter projects.", url: "https://assetstore.unity.com/templates" }
  ],
  unreal: [
    { name: "Lyra Starter Game", desc: "Epic's official free advanced shooter framework — a real production-grade starting point, not a toy demo.", url: "https://www.fab.com/listings/93faede1-4434-47c0-85f1-bf27c0820ad0" },
    { name: "City Sample", desc: "Epic's official free open-world city project from The Matrix Awakens tech demo, with vehicles and crowds. UE-Only Content — licensed for use only within Unreal Engine, not portable to other engines.", url: "https://www.fab.com/listings/4898e707-7855-404b-af0e-a505ee690e68" },
    { name: "Built-in Engine Templates", desc: "First Person, Third Person, Top Down, and Vehicle templates ship free with every Unreal install — no separate download, just pick one when creating a project.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-templates-reference" }
  ],
  construct3: [
    { name: "Construct 3 Free Templates (itch.io)", desc: "Community-made free starter projects — platformers, arcade, puzzle genres with working loops and UI.", url: "https://itch.io/game-assets/free/tag-construct-3/tag-template" }
  ],
  figma: [
    { name: "Free Game UI Kit", desc: "Free Figma Community file — duplicate directly into your own workspace, no paywall.", url: "https://www.figma.com/community/file/1065913909118984412/free-game-ui-kit" },
    { name: "Game UX Kit", desc: "Free game UI/UX wireframe kit for mocking up menus and HUDs quickly.", url: "https://www.figma.com/community/file/1460785931676185568/game-ux-kit" }
  ]
};

const ASSET_SITES = [
  { name: "Poly Pizza", desc: "6,500+ free low-poly 3D models, no login required, ready for Unity/Unreal/Godot.", url: "https://poly.pizza/" },
  { name: "Kenney", desc: "40,000+ CC0 assets — 2D, 3D, UI, and audio, all free, no signup, no attribution required.", url: "https://kenney.nl/" },
  { name: "itch.io - Free Game Assets", desc: "Huge marketplace of community-made asset packs, filterable to free-only.", url: "https://itch.io/game-assets/free" },
  { name: "OpenGameArt", desc: "Long-running community library of 2D art, 3D models, music, and sound under open licenses.", url: "https://opengameart.org/" },
  { name: "Quaternius", desc: "Free CC0 3D models — characters, vehicles, environments — in a consistent clean style.", url: "https://quaternius.com/" },
  { name: "Mixamo", desc: "Free character auto-rigging and a huge library of motion-captured animations.", url: "https://www.mixamo.com/" },
  { name: "Sketchfab", desc: "Massive 3D model marketplace — filter to downloadable and free.", url: "https://sketchfab.com/feed" },
  { name: "Freesound", desc: "Community sound effect and audio library under Creative Commons licenses.", url: "https://freesound.org/" }
];
