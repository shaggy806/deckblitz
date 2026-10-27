import { defineCard } from "../define.js";

// Rulings:
//   [2020-08-07] If a permanent on the battlefield has {X} in its mana cost, X is considered to be
//     0.

export default defineCard({
  name: "Rush of Knowledge",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw cards equal to the greatest mana value among permanents you control.",
  effect: { kind: "draw", amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } } },
});
