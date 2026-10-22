import { defineCard } from "../define.js";

// EDHREC rank 15364. Amonkhet. Abzan Charm's distribution with -1/-1
// counters: two targets get one each, one target gets both. The split is
// fixed as it's cast, so a target gone illegal loses its counter rather than
// it moving to the other (the ruling).
export default defineCard({
  name: "Splendid Agony",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Distribute two -1/-1 counters among one or two target creatures.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target-chosen", index: 1 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
        { kind: "add-counter", target: 1, counter: "-1/-1", amount: 1 },
      ],
    },
    else: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 },
  },
});
