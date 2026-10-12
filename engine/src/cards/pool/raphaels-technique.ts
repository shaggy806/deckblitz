import { defineCard } from "../define.js";

// EDHREC rank 11546.
//
// Rulings:
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] A player may choose to discard their hand even if their hand contains zero cards.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

export default defineCard({
  name: "Raphael's Technique",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  sneak: { cost: "{2}{R}" },
  text: "Sneak {2}{R} (You may cast this spell for {2}{R} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nEach player may discard their hand and draw seven cards.",
  // Arc of Fortune's shape: each player chooses, an empty hand included (the ruling).
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Discard your hand and draw seven cards?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard-hand", who: "you" },
        { kind: "draw", amount: 7 },
      ],
    },
  },
});
