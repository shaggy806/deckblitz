import { defineCard } from "../define.js";

// EDHREC rank 15130.
//
// "If a permanent was returned this way" is Mirkwood Nurturer's `this-way`
// check: no counter with no target chosen, or with the only target gone as
// it resolves (the ability doesn't resolve at all, rule 608.2b).
const ENTER =
  "When this creature enters, return up to one target non-Faerie, nonland permanent you control to its owner's hand. If a permanent was returned this way, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Nurturing Pixie",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"], notSubtypes: ["Faerie"] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
