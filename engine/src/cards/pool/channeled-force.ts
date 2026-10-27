import { defineCard } from "../define.js";

// EDHREC rank 10671. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Channeled Force",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard X cards.\nTarget player draws X cards. Channeled Force deals X damage to up to one target creature or planeswalker.",
  // Cast without paying its mana cost, X is still chosen and paid (the
  // rulings): the X is the discard's, never the mana's.
  additionalCost: { discard: "x" },
  targets: ["player", { kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x", target: 0 },
      { kind: "damage", amount: "x", target: 1 },
    ],
  },
});
