import { defineCard } from "../define.js";

// EDHREC rank 12809. Alliances. A pitch spell (Force of Will's alternative
// cost) with Splendid Agony's distribution: two targets get one -2/-1
// counter each, one target gets both.

export default defineCard({
  name: "Contagion",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  alternativeCost: {
    mana: "{0}",
    payLife: 1,
    exileFromHand: { filter: { colors: ["B"] }, text: "a black card" },
  },
  text: "You may pay 1 life and exile a black card from your hand rather than pay this spell's mana cost.\nDistribute two -2/-1 counters among one or two target creatures.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target-chosen", index: 1 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "-2/-1", amount: 1 },
        { kind: "add-counter", target: 1, counter: "-2/-1", amount: 1 },
      ],
    },
    else: { kind: "add-counter", target: 0, counter: "-2/-1", amount: 2 },
  },
});
