import { defineCard } from "../define.js";

// With delirium the search happens even with no card exiled, and the library is
// still shuffled (the ruling). Any number: the search may leave cards behind.

export default defineCard({
  name: "Pick the Brain",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it and exile that card.\nDelirium — If there are four or more card types among cards in your graveyard, search that player's graveyard, hand, and library for any number of cards with the same name as the exiled card, exile those cards, then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: {
          kind: "search-library",
          whose: { target: 0 },
          zones: "graveyard-hand-library",
          filter: { sameNameAsThisWay: "exiled" },
          destination: "exile",
          min: 0,
          max: 99,
        },
      },
    ],
  },
});
