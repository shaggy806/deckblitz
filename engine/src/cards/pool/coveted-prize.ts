import { defineCard } from "../define.js";

// EDHREC rank 6905.
//
// Rulings:
//   [2020-09-25] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs.
//   [2020-09-25] The card you search for may be the one you cast.
//   [2020-09-25] If the card has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2020-09-25] If you have a full party and wish to cast a spell with Coveted Prize's effect,
//     you do so as part of the resolution of Coveted Prize after searching for a card. You can't
//     wait to cast it later in the turn. Timing permissions based on a card's type are ignored.
//
// The full party is read after the search, as the rest of the resolution
// goes on; `cast-now` is the "you may cast" (rule 608.2g).

export default defineCard({
  name: "Coveted Prize",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: "This spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nSearch your library for a card, put it into your hand, then shuffle. If you have a full party, you may cast a spell with mana value 4 or less from your hand without paying its mana cost.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      {
        kind: "conditional",
        condition: { kind: "full-party" },
        then: { kind: "cast-now", from: "hand", free: true, spell: { manaValue: { op: "lte", n: 4 } } },
      },
    ],
  },
});
