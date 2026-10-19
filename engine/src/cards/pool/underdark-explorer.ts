import { defineCard } from "../define.js";

// EDHREC rank 14493.

export default defineCard({
  name: "Underdark Explorer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, you take the initiative.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
  ],
});
