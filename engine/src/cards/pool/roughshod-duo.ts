import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const EXPEND_TEXT = "Whenever you expend 4, target creature you control gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Roughshod Duo",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Raccoon"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
