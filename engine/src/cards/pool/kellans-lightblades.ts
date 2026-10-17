import { defineCard } from "../define.js";

// EDHREC rank 23463.
//
// Rulings:
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.

export default defineCard({
  name: "Kellan's Lightblades",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "", keyword: "bargain", effect: { kind: "destroy", target: 0 } },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nKellan's Lightblades deals 3 damage to target attacking or blocking creature. If this spell was bargained, destroy that creature instead.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
