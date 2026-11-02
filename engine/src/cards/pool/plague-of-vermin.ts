import { defineCard } from "../define.js";

// Paid at once, so each round's most is what's left; the process ends when
// everyone in a whole round pays nothing; then all the Rats enter at the same
// time (the rulings).
export default defineCard({
  name: "Plague of Vermin",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Starting with you, each player may pay any amount of life. Repeat this process until no one pays life. Each player creates a 1/1 black Rat creature token for each 1 life they paid this way.",
  targets: [],
  effect: {
    kind: "players-pay-any-amount",
    resource: "life",
    startingWithYou: true,
    untilNoOnePays: true,
    each: { kind: "create-token", token: "Rat Token", count: "x", who: "that-player" },
  },
});
