import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.
//   [2024-07-26] A permanent with an ability that triggers whenever you "expend N" will see mana
//     you spent to cast spells the turn it enters, including mana you spent before it entered.

const ENTER_TEXT = "When this creature enters, create a Food token.";
const EXPEND_TEXT = "Whenever you expend 4, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Bakersbane Duo",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Raccoon"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
