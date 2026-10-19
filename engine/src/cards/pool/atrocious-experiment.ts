import { defineCard } from "../define.js";

export default defineCard({
  name: "Atrocious Experiment",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player mills two cards, draws two cards, and loses 2 life. (To mill a card, a player puts the top card of their library into their graveyard.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 2 },
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
});
