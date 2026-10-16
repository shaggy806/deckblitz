import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] If the cost to cast a spell is increased, decreased, or changed because of
//     additional or alternative costs, expend counts only the mana you actually spent.
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.
//   [2024-07-26] A permanent with an ability that triggers whenever you "expend N" will see mana
//     you spent to cast spells the turn it enters, including mana you spent before it entered.

const EXPEND_TEXT = "Whenever you expend 4, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Wandertale Mentor",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Bard"],
  power: 2,
  toughness: 2,
  text: `${EXPEND_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)\n{T}: Add {R} or {G}.`,
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
  ],
});
