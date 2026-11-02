import { defineCard } from "../define.js";

export default defineCard({
  name: "Explosive Revelation",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose any target. Reveal cards from the top of your library until you reveal a nonland card. Explosive Revelation deals damage equal to that card's mana value to that permanent or player. Put the nonland card into your hand and the rest on the bottom of your library in any order.",
  targets: ["any-target"],
  effect: {
    kind: "reveal-until",
    filter: { notTypes: ["land"] },
    put: "hand",
    then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
    thenKeepsTargets: true,
    rest: "bottom-any-order",
  },
});
