import { defineCard } from "../define.js";

export default defineCard({
  name: "Cyclops Tyrant",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops"],
  power: 3,
  toughness: 4,
  keywords: ["intimidate"],
  text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nThis creature can't block creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "gte", n: 3 } },
      text: "This creature can't block creatures with power 2 or less.",
    },
  ],
});
