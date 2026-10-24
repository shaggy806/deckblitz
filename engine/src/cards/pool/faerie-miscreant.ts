import { defineCard } from "../define.js";

// EDHREC rank 19593.

export default defineCard({
  name: "Faerie Miscreant",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, if you control another creature named Faerie Miscreant, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", name: "Faerie Miscreant" },
        atLeast: 1,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, if you control another creature named Faerie Miscreant, draw a card.",
    },
  ],
});
