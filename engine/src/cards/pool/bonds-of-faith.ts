import { defineCard } from "../define.js";

// EDHREC rank 18467.
//
// Rulings:
//   [2011-09-22] Once the enchanted creature has been declared as an attacking or blocking
//     creature, causing it to stop being a Human won’t remove it from combat. It will lose the
//     +2/+2 bonus, however.
//
// Mishra's Domination's shape: each half a static on the enchanted creature,
// gated on whether it's a Human now.

const TEXT = "Enchanted creature gets +2/+2 as long as it's a Human. Otherwise, it can't attack or block.";
const IS_HUMAN = { kind: "source", filter: { attachedTo: { subtype: "Human" } } } as const;

export default defineCard({
  name: "Bonds of Faith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: IS_HUMAN,
      grantPt: [2, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: IS_HUMAN },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
