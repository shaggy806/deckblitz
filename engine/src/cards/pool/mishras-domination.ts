import { defineCard } from "../define.js";

// EDHREC rank 23431.
//
// Burden of Proof's shape: each half is a static on the enchanted creature
// gated on who controls it now — this Aura's controller, or not.
const TEXT = "As long as you control enchanted creature, it gets +2/+2. Otherwise, it can't block.";
const YOU_CONTROL_IT = { kind: "source", filter: { attachedTo: { controlledBy: "you" } } } as const;

export default defineCard({
  name: "Mishra's Domination",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: YOU_CONTROL_IT,
      grantPt: [2, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: YOU_CONTROL_IT },
      restrictions: ["cant-block"],
      text: TEXT,
    },
  ],
});
