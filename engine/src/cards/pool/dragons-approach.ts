import { defineCard } from "../define.js";

// EDHREC rank 9484.
//
// "You may exile this spell and four cards named Dragon's Approach from your
// graveyard. If you do, …": offered only when all of it can be done — four
// others in the graveyard (this one is on the stack as it resolves) — and
// then all of it is: the spell is exiled from the stack (so it doesn't go to
// the graveyard as it finishes, rule 608.2n), four of them are chosen and
// exiled, and the Dragon is found.

const NAMED = { name: "Dragon's Approach" } as const;

export default defineCard({
  name: "Dragon's Approach",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Dragon's Approach deals 3 damage to each opponent. You may exile this spell and four cards named Dragon's Approach from your graveyard. If you do, search your library for a Dragon creature card, put it onto the battlefield, then shuffle.\nA deck can have any number of cards named Dragon's Approach.",
  deckCopies: "any",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, who: "each-opponent" },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 4, filter: NAMED },
        then: {
          kind: "may",
          prompt: "Exile Dragon's Approach and four cards named Dragon's Approach from your graveyard to search for a Dragon?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: "source" },
              { kind: "look-and-choose", zone: "graveyard", filter: NAMED, min: 4, max: 4, destination: "exile", leftover: "stay" },
              {
                kind: "search-library",
                filter: { type: "creature", subtype: "Dragon" },
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
