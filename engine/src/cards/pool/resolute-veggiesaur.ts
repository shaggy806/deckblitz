import { defineCard } from "../define.js";

// Rulings:
//   [2022-10-07] If a die is rerolled, that counts only as a single roll. The original roll
//     doesn't count. Similarly, any die roll that's ignored doesn't count.
//   [2022-10-07] If you roll multiple dice at the same time, and one of them is your third die
//     roll that turn, the ability triggers. It's not necessary to identify which roll was the
//     third.

const THIRD_DIE_TEXT = "Whenever you roll your third die each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Resolute Veggiesaur",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Employee"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${THIRD_DIE_TEXT}`,
  triggered: [
    {
      // Counted die by die, the dice kept alone: once, on the roll that
      // holds your third die this turn, however many dice it held.
      trigger: { on: "event", event: "rolls-die", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: THIRD_DIE_TEXT,
    },
  ],
});
