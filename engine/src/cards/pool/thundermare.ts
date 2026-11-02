import { defineCard } from "../define.js";

export default defineCard({
  name: "Thundermare",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Horse"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nWhen this creature enters, tap all other creatures.",
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
