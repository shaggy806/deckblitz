import { defineCard } from "../define.js";

// EDHREC rank 20459.
//
// Rulings:
//   [2016-07-13] You may cast Stensia Banquet targeting an opponent even if you control no
//     Vampires. You'll still draw a card.
//   [2016-07-13] The number of Vampires you control is counted only as Stensia Banquet resolves.

export default defineCard({
  name: "Stensia Banquet",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Stensia Banquet deals damage to target opponent or planeswalker equal to the number of Vampires you control.\nDraw a card.",
  targets: ["opponent-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { countOf: { subtype: "Vampire", controlledBy: "you" } } },
      { kind: "draw", amount: 1 },
    ],
  },
});
