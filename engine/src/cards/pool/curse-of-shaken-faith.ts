import { defineCard } from "../define.js";

// "Other than the first spell they cast each turn" counts the spells the
// enchanted player cast before this Curse arrived too (the timing wrapper);
// a copy is never cast (rule 707.10), so every copy they make triggers it.

const TEXT =
  "Whenever enchanted player casts a spell other than the first spell they cast each turn or copies a spell, this Aura deals 2 damage to them.";

export default defineCard({
  name: "Curse of Shaken Faith",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "attached", orCopy: true, nthEachTurn: 2, orLater: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
