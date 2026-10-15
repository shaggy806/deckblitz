import { defineCard } from "../define.js";

// EDHREC rank 20233.
//
// "If you do" is whether a permanent was returned this way (Mistbreath
// Elder's `this-way` check): no counter when no target was chosen, or when the
// only target is gone as it resolves (the ability doesn't resolve at all,
// rule 608.2b).

const TEXT =
  "When this creature enters, return up to one other target permanent you control to its owner's hand. If you do, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Mirkwood Nurturer",
  manaCost: "{2}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
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
      text: TEXT,
    },
  ],
});
