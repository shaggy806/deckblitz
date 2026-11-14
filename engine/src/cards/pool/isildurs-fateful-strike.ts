import { defineCard } from "../define.js";

// - A legendary instant (rule 205.4e): castable only while you control a
//   legendary creature or planeswalker.
// - "Its controller" is the destroyed creature's, as it last existed (rule
//   608.2h); they choose the cards (`look-and-choose` of `"that-player"`),
//   as many as their hand holds past four, counted as the spell resolves.

const STRIKE =
  "Destroy target creature. If its controller has more than four cards in hand, they exile cards from their hand equal to the difference.";

export default defineCard({
  name: "Isildur's Fateful Strike",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["instant"],
  text: `(You may cast a legendary instant only if you control a legendary creature or planeswalker.)\n${STRIKE}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "for-each-player",
        who: { controllerOf: 0 },
        whoIf: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atLeast: 5 } },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: { difference: [{ cardsInHand: "that-player" }, 4] },
          max: { difference: [{ cardsInHand: "that-player" }, 4] },
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
    ],
  },
});
