import { defineCard } from "../define.js";

// EDHREC rank 20729. Fate Reforged.

export default defineCard({
  name: "Mardu Scout",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 3,
  toughness: 1,
  dash: { cost: "{1}{R}" },
  text: "Dash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
});
