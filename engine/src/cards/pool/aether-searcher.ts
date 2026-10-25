import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 29744.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// With no noted name, "you can still search your hand and/or library … but you won't cast any
// card this way" (the last ruling). Searching only the hand finds and changes nothing, so the
// one choice that matters is whether to search the library — which is still a search, and
// shuffles (Smuggler Captain's shape).
//
// Rulings:
//   [2014-05-29] If Aether Searcher is the last card you draft, there won't be a noted name. You
//     can still search your hand and/or library when it enters the battlefield, but you won't cast
//     any card this way unless you also drafted an Aether Searcher and noted a card then.

const TRIGGER =
  "When this creature enters, you may search your hand and/or library for a card with a name noted as you drafted cards named Aether Searcher. You may cast it without paying its mana cost. If you search your library this way, shuffle.";

export default defineCard({
  name: "Aether Searcher",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 6,
  toughness: 4,
  text: `Reveal this card as you draft it. Reveal the next card you draft and note its name.\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library?",
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 0 },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
