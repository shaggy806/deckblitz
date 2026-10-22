import { defineCard } from "../define.js";

// EDHREC rank 8628.

const LORD_TEXT = "Other Dinosaurs you control get +1/+1.";

export default defineCard({
  name: "Thundering Spineback",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  text: "Other Dinosaurs you control get +1/+1.\n{5}{G}: Create a 3/3 green Dinosaur creature token with trample. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dinosaur" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1 },
      resolve: null,
      text: "{5}{G}: Create a 3/3 green Dinosaur creature token with trample.",
    },
  ],
});
