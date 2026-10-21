import { defineCard } from "../define.js";

// EDHREC rank 15163.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Imperious Oligarch",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nAfterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
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
