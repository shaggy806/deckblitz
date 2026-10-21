import { defineCard } from "../define.js";

// EDHREC rank 14070.

export default defineCard({
  name: "Gates Ablaze",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gates Ablaze deals X damage to each creature, where X is the number of Gates you control.",
  targets: [],
  effect: {
    kind: "damage-all",
    filter: { type: "creature" },
    amount: { countOf: { subtype: "Gate", controlledBy: "you" } },
  },
});
