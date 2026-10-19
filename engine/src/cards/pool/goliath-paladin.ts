import { defineCard } from "../define.js";

// EDHREC rank 14085.

export default defineCard({
  name: "Goliath Paladin",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Knight"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, you take the initiative.",
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
