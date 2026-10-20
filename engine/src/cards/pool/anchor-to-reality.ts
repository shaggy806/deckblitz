import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] If a card in a player's library has {X} in its mana cost, X is 0.
//   [2022-02-18] You must sacrifice exactly one artifact or creature to cast this spell; you can't
//     cast it without sacrificing an artifact or creature, and you can't sacrifice additional
//     artifacts or creatures.

const SEARCH_TEXT =
  "Search your library for an Equipment or Vehicle card, put that card onto the battlefield, then shuffle. If it has mana value less than the sacrificed permanent's mana value, scry 2.";

export default defineCard({
  name: "Anchor to Reality",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `As an additional cost to cast this spell, sacrifice an artifact or creature.\n${SEARCH_TEXT}`,
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { subtypes: ["Equipment", "Vehicle"] },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      // "It" is the card this spell put onto the battlefield (`thisWay`); the
      // sacrificed permanent's mana value is its last-known one, bound as
      // this step applies.
      {
        kind: "conditional",
        condition: {
          kind: "this-way",
          what: "put-onto-battlefield",
          filter: { manaValue: { op: "lt", n: { amount: { manaValueOf: "sacrificed" } } } },
        },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
