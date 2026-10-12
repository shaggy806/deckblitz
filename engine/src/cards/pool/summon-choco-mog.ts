import { defineCard } from "../define.js";

// EDHREC rank 6872.
//
// Rulings:
//   [2025-06-06] Once the number of lore counters on a Saga is greater than or equal to the
//     greatest number among its chapter abilities, the Saga's controller sacrifices it as soon as
//     its chapter ability has left the stack, most likely by resolving or being countered. This
//     state-based action doesn't use the stack.
//   [2025-06-06] Once a chapter ability has triggered, the ability on the stack won't be affected
//     if the Saga gains or loses counters, or if it leaves the battlefield.

const CHAPTER_TEXT = "I, II, III, IV — Stampede! — Other creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Summon: Choco/Mog",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Bird", "Moogle"],
  power: 3,
  toughness: 3,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3, 4],
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: CHAPTER_TEXT,
    },
  ],
});
