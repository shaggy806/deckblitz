import { defineCard } from "../define.js";

// EDHREC rank 20279. The search is read as the spell resolves: both named spells cast this turn
// (by you), then you may fetch The Unspeakable onto the battlefield.

export default defineCard({
  name: "Sift Through Sands",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Draw two cards, then discard a card.\nIf you've cast a spell named Peer Through Depths and a spell named Reach Through Mists this turn, you may search your library for a card named The Unspeakable, put it onto the battlefield, then shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "cast-this-turn", filter: { name: "Peer Through Depths" } },
            { kind: "cast-this-turn", filter: { name: "Reach Through Mists" } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Search your library for a card named The Unspeakable?",
          effect: { kind: "search-library", filter: { name: "The Unspeakable" }, destination: "battlefield", min: 0, max: 1 },
        },
      },
    ],
  },
});
