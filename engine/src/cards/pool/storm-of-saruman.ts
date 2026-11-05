import { defineCard } from "../define.js";

// Top-5000 #3632.
const TEXT =
  "Whenever you cast your second spell each turn, copy it, except the copy isn't legendary. You may choose new targets for the copy. (A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "Storm of Saruman",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Ward {3}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, except: { notLegendary: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
