import { defineCard } from "../define.js";

// EDHREC rank 30662.

export default defineCard({
  name: "Kolaghan Skirmisher",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  dash: { cost: "{2}{B}" },
  text: "Dash {2}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
});
