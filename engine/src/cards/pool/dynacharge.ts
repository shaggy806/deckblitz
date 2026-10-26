import { defineCard } from "../define.js";

export default defineCard({
  name: "Dynacharge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +2/+0 until end of turn.\nOverload {2}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
  overload: {
    cost: "{2}{R}",
    effect: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 2,
      toughness: 0,
      duration: "end-of-turn",
    },
  },
});
