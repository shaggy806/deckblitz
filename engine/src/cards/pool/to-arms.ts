import { defineCard } from "../define.js";

// EDHREC rank 6797.
export default defineCard({
  name: "To Arms!",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap all creatures you control.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
