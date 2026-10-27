import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 23204. Seeker's evasion on the creature itself.

export default defineCard({
  name: "Amrou Seekers",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Rebel"],
  power: 2,
  toughness: 2,
  text: "This creature can't be blocked except by artifact creatures and/or white creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notTypes: ["artifact"], notColors: ["W"] },
      text: "This creature can't be blocked except by artifact creatures and/or white creatures.",
    },
  ],
});
