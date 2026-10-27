import { defineCard } from "../define.js";

// EDHREC rank 14808. Torment.

export default defineCard({
  name: "Sickening Dreams",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards.\nSickening Dreams deals X damage to each creature and each player.",
  additionalCost: { discard: "x" },
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
