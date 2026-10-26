import { defineCard } from "../define.js";

// EDHREC rank 31946. Shadowmoor.

export default defineCard({
  name: "Sootwalkers",
  manaCost: "{2}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Rogue"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked by white creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["W"] },
      text: "This creature can't be blocked by white creatures.",
    },
  ],
});
