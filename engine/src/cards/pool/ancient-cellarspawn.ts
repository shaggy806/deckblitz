import { defineCard } from "../define.js";

// EDHREC rank 2540. "The difference" is read from the spell as it last was on
// the stack if it has gone (the ruling): mana value less mana actually spent.

const REDUCE_TEXT = "Each spell you cast that's a Demon, Horror, or Nightmare costs {1} less to cast.";
const TRIGGER_TEXT =
  "Whenever you cast a spell, if the amount of mana spent to cast it was less than its mana value, target opponent loses life equal to the difference.";

export default defineCard({
  name: "Ancient Cellarspawn",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 3,
  text: `${REDUCE_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { subtypes: ["Demon", "Horror", "Nightmare"], controlledBy: "you" },
        reduceGeneric: 1,
      },
      text: REDUCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { manaSpent: [{ amount: { op: "lt", n: { own: "manaValue" } } }] },
      },
      targets: ["opponent"],
      effect: {
        kind: "lose-life",
        target: 0,
        amount: { difference: [{ manaValueOf: "trigger-object" }, { manaSpentOf: "trigger-object" }] },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
