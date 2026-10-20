import { defineCard } from "../define.js";

// EDHREC rank 24286.

export default defineCard({
  name: "Brimstone Vandal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  becomesDayAsEnters: true,
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nIf it's neither day nor night, it becomes day as this creature enters.\nWhenever day becomes night or night becomes day, this creature deals 1 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever day becomes night or night becomes day, this creature deals 1 damage to each opponent.",
    },
  ],
});
