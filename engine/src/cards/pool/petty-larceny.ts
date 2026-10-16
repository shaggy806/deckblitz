import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.
//   [2024-07-05] If you leave the game, the cards remain exiled face down indefinitely. No player
//     may look at them.
//   [2024-07-05] You pay all costs and follow all normal timing rules for cards played this way.
//     For example, if one of the exiled cards is a land card, you may play it only during your
//     main phase while the stack is empty.

export default defineCard({
  name: "Petty Larceny",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nLook at the top two cards of target opponent's library and exile those cards face down. You may play those cards for as long as they remain exiled, and mana of any type can be spent to cast them. Create a Treasure token.",
  freerunning: { cost: "{1}{B}" },
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "impulse-exile",
        amount: 2,
        whose: 0,
        duration: "while-exiled",
        faceDown: true,
        spendAs: "any-type",
      },
      { kind: "create-token", token: "Treasure Token", count: 1 },
    ],
  },
});
