import { defineCard } from "../define.js";

export default defineCard({
  name: "Stirring Address",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gets +2/+2 until end of turn.\nOverload {5}{W} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  overload: {
    cost: "{5}{W}",
    effect: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 2,
      toughness: 2,
      duration: "end-of-turn",
    },
  },
});
