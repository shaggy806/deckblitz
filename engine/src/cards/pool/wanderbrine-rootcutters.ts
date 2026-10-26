import { defineCard } from "../define.js";

// EDHREC rank 31916. Shadowmoor.

export default defineCard({
  name: "Wanderbrine Rootcutters",
  manaCost: "{2}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked by green creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["G"] },
      text: "This creature can't be blocked by green creatures.",
    },
  ],
});
