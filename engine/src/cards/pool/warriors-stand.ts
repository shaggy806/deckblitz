import { defineCard } from "../define.js";

// EDHREC rank 30550.

export default defineCard({
  name: "Warrior's Stand",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nCreatures you control get +2/+2 until end of turn.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
});
