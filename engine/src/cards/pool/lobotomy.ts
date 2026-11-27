import { defineCard } from "../define.js";

// EDHREC rank 30617. The chosen card stays in the hand (`destination:
// "stay"`), named for the search by `thisWay: "chosen"`. "All cards with the
// same name": every one in the graveyard is found, a public zone, and the
// hand's and library's may be left, hidden zones (rule 701.23b; Shimian
// Specter's ruling) — `all`.

export default defineCard({
  name: "Lobotomy",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target player reveals their hand, then you choose a card other than a basic land card from it. Search that player's graveyard, hand, and library for all cards with the same name as the chosen card and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "discard-chosen",
        target: 0,
        filter: { anyOf: [{ notTypes: ["land"] }, { notSupertype: "basic" }] },
        destination: "stay",
      },
      {
        kind: "search-library",
        whose: { target: 0 },
        zones: "graveyard-hand-library",
        filter: { sameNameWith: { thisWay: "chosen" } },
        destination: "exile",
        all: true,
        min: 0,
        max: 99,
      },
    ],
  },
});
