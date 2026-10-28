import { defineCard } from "../define.js";

// EDHREC rank 26662.
//
// "Becomes a Bird Giant" replaces its creature types for good (`add-types`'
// `setSubtypes` — no longer a Wall), and it loses defender for good (Elder
// Land Wurm's `lose-keywords`).
//
// Rulings:
//   [2004-10-04] It becomes both creature type Giant and creature type Bird.
//   [2005-08-01] Once it stops being a Wall, it can attack because it also loses Defender.

const BLOCK_TEXT =
  "When this creature blocks, it becomes a Bird Giant, and it loses defender. (It's no longer a Wall. This effect lasts indefinitely.)";

export default defineCard({
  name: "Ageless Sentinels",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 4,
  toughness: 4,
  keywords: ["defender", "flying"],
  text: `Defender (This creature can't attack.)\nFlying\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", setSubtypes: ["Bird", "Giant"], duration: "permanent" },
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});
