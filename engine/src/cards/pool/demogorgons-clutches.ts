import { defineCard } from "../define.js";

// EDHREC rank 17465. In the printed order: the discards come before the mill,
// so the player chooses them without seeing what's milled (the ruling).
export default defineCard({
  name: "Demogorgon's Clutches",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards, mills two cards, and loses 2 life. (To mill a card, a player puts the top card of their library into their graveyard.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "mill", target: 0, amount: 2 },
      { kind: "lose-life", target: 0, amount: 2 },
    ],
  },
});
