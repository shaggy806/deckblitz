import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 26612.
//
// Rulings:
//   [2016-07-13] If an effect allows you to cast Scour the Laboratory from your graveyard,
//     count the number of card types among cards in your graveyard after moving Scour the
//     Laboratory from your graveyard to the stack.
export default defineCard({
  name: "Scour the Laboratory",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Delirium — This spell costs {2} less to cast if there are four or more card types among cards in your graveyard.\nDraw three cards.",
  selfCostReduction: { condition: { kind: "delirium" }, reduceGeneric: 2 },
  targets: [],
  effect: { kind: "draw", amount: 3 },
});
