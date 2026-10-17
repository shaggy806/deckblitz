import { defineCard } from "../define.js";

// EDHREC rank 13175.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."

const debut = (destination: "hand" | "battlefield") =>
  ({
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 20,
        reveal: "chosen",
        min: 0,
        max: 2,
        filter: { type: "creature" },
        destination,
        leftover: "stay",
      },
      { kind: "shuffle-library" },
    ],
  }) as const;

export default defineCard({
  name: "Thunderous Debut",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  // Bargained, the revealed cards go onto the battlefield rather than into
  // the hand; the rest stay where they were for the shuffle.
  kicker: { cost: "", keyword: "bargain", effect: debut("battlefield") },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nLook at the top twenty cards of your library. You may reveal up to two creature cards from among them. If this spell was bargained, put the revealed cards onto the battlefield. Otherwise, put the revealed cards into your hand. Then shuffle.",
  effect: debut("hand"),
});
