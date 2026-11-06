import { defineCard } from "../define.js";

// EDHREC rank 32362.

export default defineCard({
  name: "Pure Energy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: {
    cost: "{2}{W}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Distribute two +1/+1 counters among one or two target creatures.\nBeam me up {2}{W} (You may cast this card from your graveyard for {2}{W} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  // Abzan Charm's shape: a second target is optional, and with it each gets one.
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target-chosen", index: 1 },
    then: {
      kind: "sequence",
      together: true,
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      ],
    },
    else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
  },
});
