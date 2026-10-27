import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 19561.
//
// Zahid's `alternativeCost` (mana {0}, tap one untapped creature you control
// — the caster picks it), gated on controlling a Plains as it's cast.

export default defineCard({
  name: "Lashknife",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "If you control a Plains, you may tap an untapped creature you control rather than pay this spell's mana cost.\nEnchant creature\nEnchanted creature has first strike.",
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 1, filter: { type: "creature" } },
    condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
  },
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike.",
    },
  ],
});
