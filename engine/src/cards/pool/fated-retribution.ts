import { defineCard } from "../define.js";

// EDHREC rank 17811.

export default defineCard({
  name: "Fated Retribution",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy all creatures and planeswalkers. If it's your turn, scry 2.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "scry", amount: 2 } },
    ],
  },
});
