import { defineCard } from "../define.js";

export default defineCard({
  name: "Dredge",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Sacrifice a creature or land.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { typesAnyOf: ["creature", "land"] }, count: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
