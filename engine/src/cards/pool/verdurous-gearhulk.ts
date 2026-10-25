import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 7894.
//
// The division is chosen as the trigger goes on the stack, at least one
// counter per target (the rulings); it may target itself.
const TEXT =
  "When this creature enters, distribute four +1/+1 counters among any number of target creatures you control.";

export default defineCard({
  name: "Verdurous Gearhulk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: 4 }],
      divided: { total: 4, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: TEXT,
    },
  ],
});
