import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 26824. Vastwood Zendikon's shape: the land
// gets the creature type and its colour (layer 5) — the ruling.
//
// Rulings:
//   [2004-10-04] This can be placed on any land, not just Forests.
//   [2004-10-04] It does give the land a color and creature type, which is unlike most other ways
//     to animate a land.

const ANIMATE_TEXT = "Enchanted land is a 5/6 green Treefolk creature that's still a land.";

export default defineCard({
  name: "Living Terrain",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ANIMATE_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Treefolk"],
      setColors: ["G"],
      setBasePt: { power: 5, toughness: 6 },
      text: ANIMATE_TEXT,
    },
  ],
});
