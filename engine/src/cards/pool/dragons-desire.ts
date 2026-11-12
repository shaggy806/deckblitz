import { defineCard } from "../define.js";

// EDHREC rank 12390.

export default defineCard({
  name: "Dragon's Desire",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Add {R} for each artifact your opponents control.",
  targets: [],
  effect: { kind: "add-mana", mana: "R", amount: { countOf: { type: "artifact", controlledBy: "opponent" } } },
});
