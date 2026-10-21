import { defineCard } from "../define.js";

// EDHREC rank 8909.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Ministrant of Obligation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "Afterlife 2 (When this creature dies, create two 1/1 white and black Spirit creature tokens with flying.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 2 },
      resolve: null,
      text: "Afterlife 2 (When this creature dies, create 2 1/1 white and black Spirit creature tokens with flying.)",
    },
  ],
});
