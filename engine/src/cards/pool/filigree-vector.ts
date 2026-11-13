import { defineCard } from "../define.js";

// EDHREC rank 4862.
//
// Rulings:
//   [2023-04-14] You may choose an artifact creature as a target for both parts of the triggered
//     ability. It will get a +1/+1 counter and a charge counter.

export default defineCard({
  name: "Filigree Vector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, put a +1/+1 counter on each of any number of target creatures and a charge counter on each of any number of target artifacts.\n{1}, {T}, Sacrifice another artifact: Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: "{1}, {T}, Sacrifice another artifact: Proliferate.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Two groups, each its own instance of "target", so an artifact
      // creature may be in both (the ruling): the creatures' members end at
      // an empty slot, then the artifacts' (`targetSpans`).
      targets: [
        { kind: "any-number", of: "creature" },
        { kind: "any-number", of: { kind: "permanent", filter: { type: "artifact" } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            group: 0,
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            kind: "for-each-target",
            from: 0,
            group: 1,
            effect: { kind: "add-counter", target: 0, counter: "charge", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each of any number of target creatures and a charge counter on each of any number of target artifacts.",
    },
  ],
});
