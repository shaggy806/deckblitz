import { defineCard } from "../define.js";

// EDHREC rank 18616.

export default defineCard({
  name: "Test of Talents",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target instant or sorcery spell. Search its controller's graveyard, hand, and library for any number of cards with the same name as that spell and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
  targets: ["instant-or-sorcery-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "search-library",
        whose: { controllerOfTarget: 0 },
        zones: "graveyard-hand-library",
        filter: { sameNameAsTarget: 0 },
        destination: "exile",
        min: 0,
        max: 99,
        then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
      },
    ],
  },
});
