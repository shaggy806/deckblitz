import { defineCard } from "../define.js";

// EDHREC rank 8756.
//
// Rulings:
//   [2024-09-20] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.

const DIES = "When this creature dies, exile the top card of your library. You may play it until the end of your next turn.";

export default defineCard({
  name: "Clockwork Percussionist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Monkey", "Toy"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${DIES}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: DIES,
    },
  ],
});
