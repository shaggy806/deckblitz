import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 12600.
//
// Rulings:
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.

const RETURNABLE: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
};

// One or two targets: a first, then up to one other (Get Out's shape). They
// return together, one move.
export default defineCard({
  name: "Leonardo's Technique",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  sneak: { cost: "{1}{W}" },
  text: "Sneak {1}{W} (You may cast this spell for {1}{W} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nReturn one or two target creature cards each with mana value 3 or less from your graveyard to the battlefield.",
  targets: [RETURNABLE, { kind: "optional", of: { kind: "other", of: RETURNABLE, than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1 },
    ],
  },
});
