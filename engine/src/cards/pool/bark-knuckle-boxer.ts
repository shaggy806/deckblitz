import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const EXPEND_TEXT = "Whenever you expend 4, this creature gains indestructible until end of turn.";

export default defineCard({
  name: "Bark-Knuckle Boxer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Berserker"],
  power: 3,
  toughness: 2,
  text: `${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
