import { defineCard } from "../define.js";

// EDHREC rank 29690.

export default defineCard({
  name: "Ingenious Thief",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, look at target player's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "look-at-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, look at target player's hand.",
    },
  ],
});
