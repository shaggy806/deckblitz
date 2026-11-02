import { defineCard } from "../define.js";

export default defineCard({
  name: "Clone Legion",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each creature target player controls, create a token that's a copy of that creature.",
  targets: ["player"],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    as: 1,
    effect: { kind: "create-token-copy", of: 1, count: 1, who: "you" },
  },
});
