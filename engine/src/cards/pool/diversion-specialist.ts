import { defineCard } from "../define.js";

// EDHREC rank 23410. Heroes for Hire's impulse draw, for {1} and a sacrifice
// of another creature or enchantment (`otherOnly`).
//
// Rulings:
//   You pay all costs and follow all timing rules for cards played this way. For example, if the
//     exiled card is a land card, you may play it only during your main phase while the stack is
//     empty.
const SAC_TEXT =
  "{1}, Sacrifice another creature or enchantment: Exile the top card of your library. You may play it this turn.";

export default defineCard({
  name: "Diversion Specialist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${SAC_TEXT}`,
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } },
      },
      otherOnly: true,
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
