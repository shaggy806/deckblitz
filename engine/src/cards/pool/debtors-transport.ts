import { defineCard } from "../define.js";

// EDHREC rank 26631.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Debtors' Transport",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 5,
  toughness: 3,
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
