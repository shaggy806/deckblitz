import { defineCard } from "../define.js";

// EDHREC rank 13993.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.
//   [2023-09-01] You still put only two of the cards into your hand if you bargain this spell.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."

const lookAt = (count: number) =>
  ({
    kind: "look-and-choose",
    zone: "library",
    count,
    min: 2,
    max: 2,
    destination: "hand",
    leftover: "bottom-random",
  }) as const;

export default defineCard({
  name: "Farsight Ritual",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  // Bargained, eight cards rather than four — still only two of them taken
  // (the ruling).
  kicker: { cost: "", keyword: "bargain", effect: lookAt(8) },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nLook at the top four cards of your library. If this spell was bargained, look at the top eight cards of your library instead. Put two of them into your hand and the rest on the bottom of your library in a random order.",
  effect: lookAt(4),
});
