import { defineCard } from "../define.js";

export default defineCard({
  name: "Erratic Explosion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose any target. Reveal cards from the top of your library until you reveal a nonland card. Erratic Explosion deals damage equal to that card's mana value to that permanent or player. Put the revealed cards on the bottom of your library in any order.",
  targets: ["any-target"],
  effect: {
    kind: "reveal-until",
    filter: { notTypes: ["land"] },
    then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
    thenKeepsTargets: true,
    rest: "bottom-any-order",
  },
});
