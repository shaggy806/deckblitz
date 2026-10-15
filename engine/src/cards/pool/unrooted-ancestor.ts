import { defineCard } from "../define.js";

// EDHREC rank 24287.
//
// Rulings:
//   [2025-04-04] You can activate Unrooted Ancestor’s last ability even if it is already tapped.

const SAC_TEXT =
  "{1}, Sacrifice another creature: This creature gains indestructible until end of turn. Tap it. (Damage and effects that say \"destroy\" don't destroy it.)";

export default defineCard({
  name: "Unrooted Ancestor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
