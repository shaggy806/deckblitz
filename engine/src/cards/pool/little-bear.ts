import { defineCard } from "../define.js";

// EDHREC rank 12060.
//
// "If that creature is a Bear" is asked as the ability resolves, of the
// target as it is then (changeling counts); an illegal target does nothing.
const ETB_TEXT =
  "When this creature enters, untap another target creature you control. If that creature is a Bear, put a +1/+1 counter on it.";

export default defineCard({
  name: "Little Bear",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Bear" } },
            then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
