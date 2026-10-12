import { defineCard } from "../define.js";

// EDHREC rank 12166.
// Makes Ninja Turtle Spirit → new token "Ninja Turtle Spirit Token" (scaffolded).
//
// Rulings:
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] You choose the player, planeswalker, or battle each token is attacking. Each
//     token can enter attacking a different player, planeswalker, or battle. They don't need to be
//     the same player, planeswalker, or battle that the creature returned to pay The Last Ronin's
//     Technique's sneak cost was attacking.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] Although the tokens enter attacking if The Last Ronin's Technique's sneak cost
//     was paid, those tokens were never declared as attacking creatures. Abilities that trigger
//     whenever a creature attacks won't trigger when those tokens enter attacking.

const TOKENS = { kind: "create-token", token: "Ninja Turtle Spirit Token", count: 3 } as const;

// With sneak paid, each token attacks a player or planeswalker of your choice,
// each its own — not necessarily what the returned creature attacked (the
// ruling). Never declared as attackers, so no "attacks" trigger sees them.
export default defineCard({
  name: "The Last Ronin's Technique",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  sneak: { cost: "{1}{W}" },
  text: "Sneak {1}{W} (You may cast this spell for {1}{W} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nCreate three 1/1 white Ninja Turtle Spirit creature tokens. If this spell's sneak cost was paid, they enter tapped and attacking.",
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castVia: "sneak" } },
    then: { ...TOKENS, tapped: true, attacking: "choose" },
    else: TOKENS,
  },
});
