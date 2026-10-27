import { defineCard } from "../define.js";

export default defineCard({
  name: "Into the Story",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if an opponent has seven or more cards in their graveyard.\nDraw four cards.",
  // Only ever {3} less, however many opponents qualify (the ruling).
  selfCostReduction: {
    condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 7 },
    reduceGeneric: 3,
  },
  targets: [],
  effect: { kind: "draw", amount: 4 },
});
