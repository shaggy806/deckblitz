import { defineCard } from "../define.js";

// EDHREC rank 32037.

export default defineCard({
  name: "Treetop Defense",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nCreatures you control gain reach until end of turn. (They can block creatures with flying.)",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: {
    kind: "grant-keyword-all",
    filter: { type: "creature", controlledBy: "you" },
    keyword: "reach",
    duration: "end-of-turn",
  },
});
