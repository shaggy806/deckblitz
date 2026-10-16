import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] You may choose to discard your hand even if your hand contains zero cards.
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const EXPEND_TEXT = "Whenever you expend 4, you may discard your hand. If you do, draw two cards.";

export default defineCard({
  name: "Byway Barterer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Raccoon", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      // Offered with an empty hand too (the ruling): choosing it is the "if you do".
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw two cards?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: 2 },
      },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
