import { defineCard } from "../define.js";

// EDHREC rank 23711.

export default defineCard({
  name: "Wu Scout",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhen this creature enters, look at target opponent's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "look-at-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, look at target opponent's hand.",
    },
  ],
});
