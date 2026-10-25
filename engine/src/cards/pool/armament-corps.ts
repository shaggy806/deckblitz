import { defineCard } from "../define.js";

// EDHREC rank 29251.
// It may target itself. The targets and the split are chosen as the ability
// goes on the stack, at least one counter each; a target gone illegal loses
// its share (the rulings — Armament Dragon's `divided`).
const ENTER_TEXT =
  "When this creature enters, distribute two +1/+1 counters among one or two target creatures you control.";

export default defineCard({
  name: "Armament Corps",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 2 }],
      divided: { total: 2, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
