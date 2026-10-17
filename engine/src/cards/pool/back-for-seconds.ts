import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 7864.
//
// Rulings:
//   [2023-09-01] If you bargain this spell, you can still choose not to put one of the cards onto
//     the battlefield, even if at least one is eligible.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they’re bargained.
//     You ignore those targeting requirements if those spells aren’t bargained, and you can’t
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won’t be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain means “As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token.”
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is “bargained.”
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell’s
//     bargain cost.
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that’s already on the battlefield, the new
//     permanent isn’t bargained, even if the original was.

export default defineCard({
  name: "Back for Seconds",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  // Bargained: up to one of the targets still there with mana value 4 or
  // less onto the battlefield — none, if its caster likes (the ruling) — and
  // the rest into the hand, in the same move (Sepulchral Primordial's
  // choice among its own targets).
  kicker: {
    cost: "",
    keyword: "bargain",
    effect: {
      kind: "look-and-choose",
      zone: "targets",
      min: 0,
      max: 1,
      filter: { manaValue: { op: "lte", n: 4 } },
      destination: "battlefield",
      leftover: "hand",
    },
  },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nReturn up to two target creature cards from your graveyard to your hand. If this spell was bargained, you may put one of those cards with mana value 4 or less onto the battlefield instead of putting it into your hand.",
  // Fight On!'s "return up to two target creature cards from your graveyard".
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
