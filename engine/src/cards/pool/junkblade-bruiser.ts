import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] A permanent with an ability that triggers whenever you "expend N" will see mana
//     you spent to cast spells the turn it enters, including mana you spent before it entered. If
//     you cast Junkblade Bruiser by paying its full cost of five mana, its ability won't be able to
//     trigger at all that turn.

const EXPEND_TEXT = "Whenever you expend 4, this creature gets +2/+1 until end of turn.";

export default defineCard({
  name: "Junkblade Bruiser",
  manaCost: "{3}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Berserker"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
