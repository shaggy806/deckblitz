import { defineCard } from "../define.js";

// EDHREC rank 16880.
//
// The targets and the division are chosen as the ability goes on the stack,
// at least one counter each; a target gone illegal loses its share (the
// rulings — rule 601.2d).

const ENTER_TEXT =
  "When this creature enters, distribute three +1/+1 counters among one, two, or three target creatures you control.";

export default defineCard({
  name: "Armament Dragon",
  manaCost: "{3}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
