import { defineCard } from "../define.js";

// EDHREC rank 25398.

export default defineCard({
  name: "Shrieking Mogg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, tap all other creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, tap all other creatures.",
    },
  ],
});
