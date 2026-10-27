import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 19638. Bravado's count: every
// creature you control, less one while the enchanted creature is one of
// yours ("each other creature" is other than the enchanted one).
const TEXT = "Enchanted creature gets +0/+2 for each other creature you control.";

export default defineCard({
  name: "Conclave's Blessing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [0, 2] },
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature", controlledBy: "you" } } },
      grantPt: [0, -2],
      text: TEXT,
    },
  ],
});
