import { defineCard } from "../define.js";

// EDHREC rank 24550.
//
// Not an intervening if: the ability always triggers, and whether you control
// a creature with a +1/+1 counter is checked only as it resolves (the ruling).

const TEXT = "When this creature enters, draw a card if you control a creature with a +1/+1 counter on it.";

export default defineCard({
  name: "Chronicler of Heroes",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
          atLeast: 1,
        },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
