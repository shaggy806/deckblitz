import { defineCard } from "../define.js";

const TEXT =
  "Galvanize deals 3 damage to target creature. If you've drawn two or more cards this turn, Galvanize deals 5 damage to that creature instead.";

export default defineCard({
  name: "Galvanize",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});
