import { defineCard } from "../define.js";

// EDHREC rank 9534.
//
// Rulings:
//   [2026-01-27] The token copies exactly what was printed on the original artifact (unless that
//     artifact is copying something else or is a token; see below). It doesn't copy whether that
//     artifact is tapped or untapped, whether it has any counters on it, or any Auras or Equipment
//     attached to it, or any non-copy effects that have changed its types, color, power and
//     toughness, and so on.
//   [2026-01-27] If the copied artifact is a token, the new token that's created copies the
//     original characteristics of that token as stated by the effect that created the token.
//   [2026-01-27] If the copied artifact is copying something else, then the token enters as
//     whatever that artifact copied.
//   [2026-01-27] If the copied artifact has {X} in its mana cost, X is 0.
//   [2026-01-27] If the artifact copied by the token had any "when [this artifact] enters"
//     abilities, the token also has those abilities, and they'll trigger when it's created.
//     Similarly, any "as [this artifact] enters" or "[this artifact] enters with" abilities that
//     the token has copied will also work.
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

const DAMAGE_TEXT =
  "Whenever Donatello deals combat damage to a player, create a token that's a copy of target artifact you control.";

export default defineCard({
  name: "Donatello, Gadget Master",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 2,
  sneak: { cost: "{1}{U}" },
  text: `Sneak {1}{U} (You may cast this spell for {1}{U} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "artifact", controlledBy: "you" } }],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
