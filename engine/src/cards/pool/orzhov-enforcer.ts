import { defineCard } from "../define.js";

// EDHREC rank 8973.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Orzhov Enforcer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nAfterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
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
