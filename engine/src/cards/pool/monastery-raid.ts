import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.
//   [2024-07-05] You pay all costs and follow all normal timing rules for cards played this way.
//     For example, if one of the exiled cards is a land card, you may play it only during your
//     main phase while the stack is empty.

export default defineCard({
  name: "Monastery Raid",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Freerunning {X}{R} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nExile the top two cards of your library. If this spell's freerunning cost was paid, exile the top X cards of your library instead. You may play the exiled cards until the end of your next turn.",
  freerunning: { cost: "{X}{R}" },
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castVia: "freerunning" } },
    then: { kind: "impulse-exile", amount: "x", duration: "your-next-turn" },
    else: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
  },
});
