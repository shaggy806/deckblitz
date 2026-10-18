import { defineCard } from "../define.js";

// EDHREC rank 14939.
//
// The division is chosen as the ability goes on the stack, at least one
// counter each (the rulings); the life is the greatest toughness after the
// counters, as it resolves.

const ENTER_TEXT =
  "When this creature enters, distribute three +1/+1 counters among one, two, or three target creatures, then you gain life equal to the greatest toughness among creatures you control.";

export default defineCard({
  name: "Glint Weaver",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counters-divided", from: 0, counter: "+1/+1" },
          {
            kind: "gain-life",
            amount: { aggregate: "max", of: "toughness", filter: { type: "creature", controlledBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
