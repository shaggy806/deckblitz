import { defineCard } from "../define.js";

// EDHREC rank 16441.
//
// Rulings:
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell’s
//     bargain cost.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they’re bargained.
//     You ignore those targeting requirements if those spells aren’t bargained, and you can’t
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won’t be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that’s already on the battlefield, the new
//     permanent isn’t bargained, even if the original was.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is “bargained.”
//   [2023-09-01] If you bargained Brave the Wilds and the target land is an illegal target by the
//     time it tries to resolve, the spell won't resolve. You won't search for a basic land card,
//     and you won't shuffle.
//   [2023-09-01] Bargain means “As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token.”

const SEARCH = {
  kind: "search-library",
  filter: { supertype: "basic", type: "land" },
  destination: "hand",
  min: 0,
  max: 1,
  reveal: true,
} as const;

export default defineCard({
  name: "Brave the Wilds",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  // Its target only when bargained (rule 702.166d); a bargained cast whose
  // land is gone by resolution doesn't resolve at all, search included (the
  // ruling — rule 608.2b).
  kicker: {
    cost: "",
    keyword: "bargain",
    targets: ["land-you-control"],
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 3,
          addTypes: ["creature"],
          addSubtypes: ["Elemental"],
          keywords: ["haste"],
          duration: "permanent",
        },
        SEARCH,
      ],
    },
  },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nIf this spell was bargained, target land you control becomes a 3/3 Elemental creature with haste that's still a land.\nSearch your library for a basic land card, reveal it, put it into your hand, then shuffle.",
  effect: SEARCH,
});
