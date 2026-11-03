import { defineCard } from "../define.js";

export default defineCard({
  name: "Kamahl's Summons",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player may reveal any number of creature cards from their hand. Then each player creates a 2/2 green Bear creature token for each card they revealed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: 0,
          max: { cardsInHand: "that-player" },
          filter: { type: "creature" },
          destination: "reveal",
          leftover: "stay",
        },
      },
      { kind: "create-token", token: "Bear Token", count: { thisWay: "revealed", who: "each" }, who: "each-player" },
    ],
  },
});
