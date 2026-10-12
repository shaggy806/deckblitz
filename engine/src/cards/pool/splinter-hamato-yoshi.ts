import { defineCard } from "../define.js";

// EDHREC rank 10008.
//
// Rulings:
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.

const LORD_TEXT = "Other Ninjas you control get +1/+1.";

export default defineCard({
  name: "Splinter, Hamato Yoshi",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Rat"],
  power: 1,
  toughness: 3,
  keywords: ["menace"],
  sneak: { cost: "{B}" },
  text: `Sneak {B} (You may cast this spell for {B} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\nMenace (This creature can't be blocked except by two or more creatures.)\n${LORD_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Ninja" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});
