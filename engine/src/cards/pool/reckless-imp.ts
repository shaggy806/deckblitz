import { defineCard } from "../define.js";

// EDHREC rank 23436.

export default defineCard({
  name: "Reckless Imp",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  dash: { cost: "{1}{B}" },
  text: "Flying\nThis creature can't block.\nDash {1}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
