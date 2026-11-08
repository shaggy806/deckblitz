import { defineCard } from "../define.js";

const TEXT = "Chroma — {2}, Sacrifice a creature: This enchantment deals damage to any target equal to the number of red mana symbols in the sacrificed creature's mana cost.";

// Hybrid symbols count; the creature is read as it last existed (a token copy's
// copied cost, 608.2h).
export default defineCard({
  name: "Fiery Bombardment",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { manaSymbolsOf: { paid: "sacrificed" }, color: "R" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
