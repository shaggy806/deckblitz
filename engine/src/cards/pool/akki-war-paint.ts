import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 14606.
//
// Born to Drive's gate: the bonus applies only while the enchanted permanent is a creature
// (a crewed Vehicle, an animated artifact).
const BONUS_TEXT = "As long as enchanted permanent is a creature, it gets +2/+1.";

export default defineCard({
  name: "Akki War Paint",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${BONUS_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [2, 1],
      text: BONUS_TEXT,
    },
  ],
});
