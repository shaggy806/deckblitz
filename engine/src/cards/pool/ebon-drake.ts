import { defineCard } from "../define.js";

export default defineCard({
  name: "Ebon Drake",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever a player casts a spell, you lose 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "Whenever a player casts a spell, you lose 1 life.",
    },
  ],
});
