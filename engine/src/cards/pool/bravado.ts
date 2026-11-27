import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 14101. "Each other creature you control" is
// other than the enchanted creature (`hostOfSource: false`; `grantPtPerCount`'s
// `excludeSelf` would leave out this Aura, not the creature). Continuously
// calculated (the ruling).

const TEXT = "Enchanted creature gets +1/+1 for each other creature you control.";

export default defineCard({
  name: "Bravado",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you", hostOfSource: false }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
