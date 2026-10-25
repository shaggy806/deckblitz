import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 31357. A white-and-blue creature matches once,
// so it's dealt 1 damage (the ruling).

export default defineCard({
  name: "Evaporate",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Evaporate deals 1 damage to each white and/or blue creature.",
  targets: [],
  effect: {
    kind: "damage-all",
    filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
    amount: 1,
  },
});
