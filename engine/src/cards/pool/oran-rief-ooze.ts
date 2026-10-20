import { defineCard } from "../define.js";

// EDHREC rank 7811.
//
// Rulings:
//   [2020-09-25] The group of creatures that receive a +1/+1 counter from the second ability is
//     determined only as the ability resolves.
//   [2020-09-25] Oran-Rief Ooze can be the target of its own first ability.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control.";
const ATTACK_TEXT =
  "Whenever this creature attacks, put a +1/+1 counter on each attacking creature with a +1/+1 counter on it.";

export default defineCard({
  name: "Oran-Rief Ooze",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // The group is read as it resolves (its ruling).
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", attacking: true, counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
