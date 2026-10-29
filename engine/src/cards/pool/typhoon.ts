import { defineCard } from "../define.js";

// Legends. Each opponent is dealt damage by their own count of Islands.

const TEXT = "Typhoon deals damage to each opponent equal to the number of Islands that player controls.";

export default defineCard({
  name: "Typhoon",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "damage",
    who: "each-opponent",
    amount: { countOf: { subtype: "Island", controlledBy: "you" }, forEachPlayer: true },
  },
});
