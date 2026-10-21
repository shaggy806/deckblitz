import { defineCard } from "../define.js";

// EDHREC rank 25740.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Syndicate Messenger",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAfterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      resolve: null,
      text: "Afterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
    },
  ],
});
