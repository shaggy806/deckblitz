import { defineCard } from "../define.js";

// EDHREC rank 9982. Amonkhet. With its only target illegal the whole spell
// doesn't resolve, so no one mills (the ruling — rule 608.2b).
export default defineCard({
  name: "Winds of Rebuke",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target nonland permanent to its owner's hand. Each player mills two cards.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "mill", target: "each-player", amount: 2 },
    ],
  },
});
