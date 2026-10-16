import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const EXPEND_TEXT = "Whenever you expend 4, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "Teapot Slinger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Raccoon", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
