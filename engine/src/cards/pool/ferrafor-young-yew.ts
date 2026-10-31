import { defineCard } from "../define.js";

// Rulings:
//   [2025-11-17] To double the number of each kind of counter on a creature, put another counter
//     on it for each counter it already has.
//   [2025-11-17] Use the number of counters among creatures the target player controls when
//     Ferrafor's first ability resolves to determine how many Saprolings are created.

const ENTER_TEXT =
  "When Ferrafor enters, create a number of 1/1 green Saproling creature tokens equal to the number of counters among creatures target player controls.";
const DOUBLE_TEXT = "{T}: Double the number of each kind of counter on target creature.";

export default defineCard({
  name: "Ferrafor, Young Yew",
  manaCost: "{6}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 4,
  toughness: 7,
  text: `${ENTER_TEXT}\n${DOUBLE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      // Every counter of every kind among them, from the target player's side.
      effect: {
        kind: "create-token",
        token: "Saproling Token",
        count: {
          aggregate: "sum",
          of: "counters",
          filter: { type: "creature", controlledBy: "you" },
          forTarget: 0,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
