import { defineCard } from "../define.js";

// EDHREC rank 24148. Delirium is checked as it resolves, once the spell is
// countered (its card now in the graveyard it was countered into).

export default defineCard({
  name: "Invasive Surgery",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target sorcery spell.\nDelirium — If there are four or more card types among cards in your graveyard, search the graveyard, hand, and library of that spell's controller for any number of cards with the same name as that spell, exile those cards, then that player shuffles.",
  targets: [{ kind: "spell", filter: { type: "sorcery" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: {
          kind: "search-library",
          whose: { controllerOfTarget: 0 },
          zones: "graveyard-hand-library",
          filter: { sameNameAsTarget: 0 },
          destination: "exile",
          min: 0,
          max: 99,
        },
      },
    ],
  },
});
