import { defineCard } from "../define.js";

// EDHREC rank 23649.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Knight of the Last Breath",
  manaCost: "{5}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Giant", "Knight"],
  power: 4,
  toughness: 4,
  text: "{3}, Sacrifice another nontoken creature: Create a 1/1 white and black Spirit creature token with flying.\nAfterlife 3 (When this creature dies, create three 1/1 white and black Spirit creature tokens with flying.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: { filter: { token: false, type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      resolve: null,
      text: "{3}, Sacrifice another nontoken creature: Create a 1/1 white and black Spirit creature token with flying.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 3 },
      resolve: null,
      text: "Afterlife 3 (When this creature dies, create 3 1/1 white and black Spirit creature tokens with flying.)",
    },
  ],
});
