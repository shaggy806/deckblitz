import { defineCard } from "../define.js";

// EDHREC rank 9160.

export default defineCard({
  name: "Aarakocra Sneak",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Rogue"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you take the initiative.",
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
