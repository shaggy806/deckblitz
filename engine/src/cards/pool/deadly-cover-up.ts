import { defineCard } from "../define.js";

// EDHREC rank 10665. The card exiled from an opponent's graveyard is chosen, not
// targeted, and may be a basic land (the ruling); its owner's zones are
// searched for its name, and "that player" draws after the shuffle.

export default defineCard({
  name: "Deadly Cover-Up",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "collect-evidence", collectEvidence: 6 },
  text: "As an additional cost to cast this spell, you may collect evidence 6.\nDestroy all creatures. If evidence was collected, exile a card from an opponent's graveyard. Then search its owner's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      {
        kind: "conditional",
        condition: { kind: "self-kicked" },
        then: {
          kind: "look-and-choose",
          zone: "graveyards",
          filter: { ownedBy: "opponent" },
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
          then: {
            kind: "search-library",
            whose: { ownerOfTarget: 0 },
            zones: "graveyard-hand-library",
            filter: { sameNameAsTarget: 0 },
            destination: "exile",
            min: 0,
            max: 99,
            then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
          },
        },
      },
    ],
  },
});
