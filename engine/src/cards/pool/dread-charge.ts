import { defineCard } from "../define.js";

// A rule for the rest of the turn over black creatures you control — one that
// enters or turns black later is bound too (rule 611.2c: it changes no
// characteristic). "Except by black creatures" is "can't be blocked by
// nonblack creatures" (rule 509.1b).
export default defineCard({
  name: "Dread Charge",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Black creatures you control can't be blocked this turn except by black creatures.",
  targets: [],
  effect: {
    kind: "restrict",
    filter: { type: "creature", colors: ["B"], controlledBy: "you" },
    restrictions: [],
    cantBeBlockedBy: { notColors: ["B"] },
  },
});
