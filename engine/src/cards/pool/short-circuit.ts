import { defineCard } from "../define.js";

// EDHREC rank 25649. Favor of Jukai's gate (the enchanted permanent is a
// creature now) over Starforged Sword's "loses flying", which applies at the
// Aura's timestamp: flying granted later isn't lost (rule 613.7e).

const STATIC_TEXT = "As long as enchanted permanent is a creature, it gets -3/-0 and loses flying.";

export default defineCard({
  name: "Short Circuit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant artifact or creature\n${STATIC_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPt: [-3, 0],
      loseKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
});
