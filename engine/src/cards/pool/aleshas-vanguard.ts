import { defineCard } from "../define.js";

// EDHREC rank 27865. Fate Reforged.

export default defineCard({
  name: "Alesha's Vanguard",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  dash: { cost: "{2}{B}" },
  text: "Dash {2}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
});
