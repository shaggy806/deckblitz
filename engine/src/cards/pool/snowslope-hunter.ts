import { defineCard } from "../define.js";

// EDHREC rank 19021.
//
// Rulings:
//   [2026-06-29] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty and only if you have an available land play remaining.

export default defineCard({
  name: "Snowslope Hunter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Ranger"],
  power: 2,
  toughness: 3,
  text: "Sacrifice another creature or artifact: Exile the top card of your library. You may play it until the end of your next turn. Activate only during your turn and only once each turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } },
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: "Sacrifice another creature or artifact: Exile the top card of your library. You may play it until the end of your next turn. Activate only during your turn and only once each turn.",
      otherOnly: true,
      condition: { kind: "your-turn" },
      oncePerTurn: true,
    },
  ],
});
