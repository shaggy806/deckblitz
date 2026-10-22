import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 21974.
//
// Rulings:
//   If you put enough -1/-1 counters on Defiant Greatmaw so that its toughness
//   is 0 or less, its last ability triggers.

const ETB = "When this creature enters, put two -1/-1 counters on target creature you control.";
const TRIGGER =
  "Whenever you put one or more -1/-1 counters on this creature, remove a -1/-1 counter from another target creature you control.";

export default defineCard({
  name: "Defiant Greatmaw",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hippo"],
  power: 4,
  toughness: 5,
  text: `${ETB}\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "-1/-1", byYou: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
