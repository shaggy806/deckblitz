import { defineCard } from "../define.js";

// EDHREC rank 18931. Fifth Dawn.

export default defineCard({
  name: "Feedback Bolt",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Feedback Bolt deals damage to target player or planeswalker equal to the number of artifacts you control.",
  targets: ["player-or-planeswalker"],
  effect: { kind: "damage", amount: { countOf: { type: "artifact", controlledBy: "you" } }, target: 0 },
});
