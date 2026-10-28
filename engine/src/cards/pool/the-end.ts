import { defineCard } from "../define.js";

// EDHREC rank 23834. "Its controller" as the permanent last existed on the
// battlefield (rule 608.2h); "that player" draws after the shuffle.

export default defineCard({
  name: "The End",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if your life total is 5 or less.\nExile target creature or planeswalker. Search its controller's graveyard, hand, and library for any number of cards with the same name as that permanent and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
  selfCostReduction: { condition: { kind: "life-total", atMost: 5 }, reduceGeneric: 2 },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
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
