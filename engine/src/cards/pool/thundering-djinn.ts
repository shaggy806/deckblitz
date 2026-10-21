import { defineCard } from "../define.js";

// Ruling: only cards drawn count, not cards put into the hand otherwise.
const TEXT =
  "Whenever this creature attacks, it deals damage to any target equal to the number of cards you've drawn this turn.";

export default defineCard({
  name: "Thundering Djinn",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { turnStat: "cards-drawn", who: "you" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
