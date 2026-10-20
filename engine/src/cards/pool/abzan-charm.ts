import { defineCard } from "../define.js";

// The third mode is Throw a Line's distribution: two targets get one counter
// each, one target gets both. The split is fixed as it's cast, so a target
// gone illegal loses its counter rather than it moving to the other (the
// ruling): its `add-counter` just finds nothing.
export default defineCard({
  name: "Abzan Charm",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["instant"],
  text: "Choose one —\n• Exile target creature with power 3 or greater.\n• You draw two cards and you lose 2 life.\n• Distribute two +1/+1 counters among one or two target creatures.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile target creature with power 3 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 3 } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "You draw two cards and you lose 2 life.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "lose-life", amount: 2 },
          ],
        },
      },
      {
        text: "Distribute two +1/+1 counters among one or two target creatures.",
        targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
        effect: {
          kind: "conditional",
          condition: { kind: "target-chosen", index: 1 },
          then: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
            ],
          },
          else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        },
      },
    ],
  },
});
