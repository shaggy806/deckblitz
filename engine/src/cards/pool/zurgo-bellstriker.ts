import { defineCard } from "../define.js";

// EDHREC rank 15848.
export default defineCard({
  name: "Zurgo Bellstriker",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 2,
  toughness: 2,
  dash: { cost: "{1}{R}" },
  text: "Zurgo can't block creatures with power 2 or greater.\nDash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "lte", n: 1 } },
      text: "Zurgo can't block creatures with power 2 or greater.",
    },
  ],
});
