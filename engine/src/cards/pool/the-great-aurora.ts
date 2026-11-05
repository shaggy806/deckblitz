import { defineCard } from "../define.js";

// Tokens count toward the draw (the ruling), and the lands are chosen in turn,
// from you, then enter simultaneously (the ruling).
export default defineCard({
  name: "The Great Aurora",
  manaCost: "{6}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Each player shuffles all cards from their hand and all permanents they own into their library, then draws that many cards. Each player may put any number of land cards from their hand onto the battlefield. Exile The Great Aurora.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "shuffle-graveyard-into-library",
        target: "each-player",
        zones: ["hand", "permanents"],
        drawThatMany: true,
      },
      {
        kind: "for-each-player",
        who: "each-player",
        choicesHeld: true,
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 0,
          max: { cardsInHand: "that-player" },
          filter: { type: "land" },
          destination: "battlefield",
          leftover: "stay",
        },
      },
    ],
  },
});
