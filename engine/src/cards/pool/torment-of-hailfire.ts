import { defineCard } from "../define.js";

// EDHREC rank 624.
//
// X passes of Nicol Bolas, the Deceiver's punisher: in each, every opponent
// in turn order chooses a nonland permanent, a card face down, or neither;
// then the sacrifices and discards happen together and each who did neither
// loses 3 life (the rulings). X = 0 does nothing.

export default defineCard({
  name: "Torment of Hailfire",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Repeat the following process X times. Each opponent loses 3 life unless that player sacrifices a nonland permanent of their choice or discards a card.",
  effect: {
    kind: "repeat",
    times: "x",
    effect: {
      kind: "each-player-may",
      who: "each-opponent",
      options: [
        { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
        { discard: 1, text: "Discard a card" },
      ],
      ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
    },
  },
});
