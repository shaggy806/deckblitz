import { defineCard } from "../define.js";

// EDHREC rank 16421.
//
// As Dragon's Approach: offered only with four others in the graveyard (this
// one is on the stack as it resolves), and then all of it is done — the spell
// exiled from the stack (rule 608.2n), four of them chosen and exiled, and
// the Sphinx found.

const NAMED = { name: "Sphinx's Approach" } as const;

export default defineCard({
  name: "Sphinx's Approach",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards. Then you may exile this spell and four cards named Sphinx's Approach from your graveyard. If you do, search your library for a Sphinx creature card, put it onto the battlefield, then shuffle.\nA deck can have any number of cards named Sphinx's Approach.",
  deckCopies: "any",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 4, filter: NAMED },
        then: {
          kind: "may",
          prompt: "Exile Sphinx's Approach and four cards named Sphinx's Approach from your graveyard to search for a Sphinx?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: "source" },
              { kind: "look-and-choose", zone: "graveyard", filter: NAMED, min: 4, max: 4, destination: "exile", leftover: "stay" },
              {
                kind: "search-library",
                filter: { type: "creature", subtype: "Sphinx" },
                destination: "battlefield",
                min: 0,
                max: 1,
              },
            ],
          },
        },
      },
    ],
  },
});
