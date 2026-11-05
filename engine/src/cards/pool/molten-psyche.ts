import { defineCard } from "../define.js";

// Every card each opponent drew this turn, not just these (the ruling).
export default defineCard({
  name: "Molten Psyche",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player shuffles the cards from their hand into their library, then draws that many cards.\nMetalcraft — If you control three or more artifacts, Molten Psyche deals damage to each opponent equal to the number of cards that player has drawn this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand"], drawThatMany: true },
      {
        kind: "conditional",
        condition: { kind: "metalcraft" },
        then: { kind: "damage", who: "each-opponent", amount: { turnStat: "cards-drawn", who: "each" } },
      },
    ],
  },
});
