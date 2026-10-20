import { defineCard } from "../define.js";

export default defineCard({
  name: "Ritual of Hope",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 until end of turn.\nCoven — If you control three or more creatures with different powers, creatures you control get +2/+1 until end of turn instead.",
  targets: [],
  // Coven is read as the spell resolves.
  effect: {
    kind: "conditional",
    condition: { kind: "coven" },
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 2,
      toughness: 1,
      duration: "end-of-turn",
    },
    else: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 1,
      toughness: 1,
      duration: "end-of-turn",
    },
  },
});
