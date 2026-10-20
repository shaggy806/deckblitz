import { defineCard } from "../define.js";

// EDHREC rank 26237.

export default defineCard({
  name: "Firmament Sage",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  becomesDayAsEnters: true,
  text: "If it's neither day nor night, it becomes day as this creature enters.\nWhenever day becomes night or night becomes day, draw a card.",
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever day becomes night or night becomes day, draw a card.",
    },
  ],
});
