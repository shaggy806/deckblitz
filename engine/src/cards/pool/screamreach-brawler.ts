import { defineCard } from "../define.js";

// EDHREC rank 27034.

export default defineCard({
  name: "Screamreach Brawler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Berserker"],
  power: 2,
  toughness: 3,
  dash: { cost: "{1}{R}" },
  text: "Dash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
});
