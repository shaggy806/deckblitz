import { defineCard } from "../define.js";

// EDHREC rank 14279.
//
// Rulings:
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

const STATIC_TEXT = "Leonardo gets +1/+0 for each other creature you control.";

export default defineCard({
  name: "Leonardo, Big Brother",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 1,
  toughness: 3,
  sneak: { cost: "{W}" },
  text: `Sneak {W} (You may cast this spell for {W} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: STATIC_TEXT,
    },
  ],
});
