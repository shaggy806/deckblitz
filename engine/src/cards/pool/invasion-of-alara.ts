import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 11662. Everything exiled stays there as it's exiled (one at a
// time, face up), so "those two cards" are the exiled cards still matching
// the search's filter as cards (`cast-now`'s `filter`, not `spell`: a split
// card or a modal face exiled on the way can't pass as the spell). One cast
// goes to the stack; "put one of them into your hand" is then the other, or,
// with none cast, the one chosen — the other staying in exile (the ruling);
// and only the cards that didn't match go to the bottom.
//
// Rulings:
//   [2023-04-14] For Invasion of Alara's triggered ability, if you exile two nonland cards with
//     mana value 4 or less, but you don't cast one of them, the one you don't put into your hand
//     will remain in exile. It won't be put on the bottom of your library.
//   [2023-04-14] If you exile only one nonland card with mana value 4 or less, you'll have the
//     option to cast it. If you don't, you'll put it into your hand.
//   [2023-04-14] If you cast a spell without paying its mana cost, you can't choose to cast it
//     for any alternative costs. You can, however, pay any additional costs. If the spell has any
//     mandatory additional costs, you must pay those.
//   [2023-04-14] If the spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.

const FOUND: CardFilter = { notTypes: ["land"], manaValue: { op: "lte", n: 4 } };

const ENTERS_TEXT =
  "When this Siege enters, exile cards from the top of your library until you exile two nonland cards with mana value 4 or less. You may cast one of those two cards without paying its mana cost. Put one of them into your hand. Then put the other cards exiled this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Invasion of Alara",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 7,
  text: `(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-until-count", filter: FOUND, count: 2, exile: true, put: "with-rest", rest: "stay" },
          { kind: "cast-now", from: "exiled-this-way", filter: FOUND, free: true },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            filter: FOUND,
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            prompt: "Put one of those cards into your hand (the other stays in exile)",
          },
          { kind: "move-exiled-this-way", to: "library-bottom", filter: { not: FOUND } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  faces: ["Invasion of Alara", "Awaken the Maelstrom"],
  transform: true,
});
