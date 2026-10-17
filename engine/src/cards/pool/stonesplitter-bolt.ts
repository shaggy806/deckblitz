import { defineCard } from "../define.js";

// EDHREC rank 12272.
//
// Rulings:
//   [2023-09-01] Bargain means “As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token.”
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell’s
//     bargain cost.
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that’s already on the battlefield, the new
//     permanent isn’t bargained, even if the original was.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they’re bargained.
//     You ignore those targeting requirements if those spells aren’t bargained, and you can’t
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won’t be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is “bargained.”

export default defineCard({
  name: "Stonesplitter Bolt",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  // Twice X as Torch the Witness says it.
  kicker: { cost: "", keyword: "bargain", effect: { kind: "damage", amount: { sum: ["x", "x"] }, target: 0 } },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nStonesplitter Bolt deals X damage to target creature or planeswalker. If this spell was bargained, it deals twice X damage to that permanent instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: "x", target: 0 },
});
