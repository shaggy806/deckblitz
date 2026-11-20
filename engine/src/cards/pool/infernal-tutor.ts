import { defineCard } from "../define.js";

// Dissension (DIS). Hellbent is read as it resolves, the tutor itself on the
// stack: with no cards in hand there is nothing to reveal, and the search is
// for any card instead. Otherwise the card revealed (Eladamri, Korvecdal's
// `look-and-choose` from the hand, kept there) names what's searched for —
// `sameNameWith: 0`, the revealed card in its `then` slot (rule 201.2a). A
// search for a card with a stated quality may find nothing (701.23b).
export default defineCard({
  name: "Infernal Tutor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Reveal a card from your hand. Search your library for a card with the same name as that card, reveal it, put it into your hand, then shuffle.\nHellbent — If you have no cards in hand, instead search your library for a card, put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "hand-size", atMost: 0 },
    then: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
    else: {
      kind: "look-and-choose",
      zone: "hand",
      min: 1,
      max: 1,
      destination: "reveal",
      leftover: "stay",
      then: {
        kind: "search-library",
        filter: { sameNameWith: 0 },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
    },
  },
});
