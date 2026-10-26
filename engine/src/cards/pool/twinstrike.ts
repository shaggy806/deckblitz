import { defineCard } from "../define.js";

// Dissension. Hellbent is read as the spell resolves.
export default defineCard({
  name: "Twinstrike",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Twinstrike deals 2 damage to each of two target creatures.\nHellbent — Destroy those creatures instead if you have no cards in hand.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "hand-size", atMost: 0 },
    then: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "destroy", target: 1 },
      ],
    },
    else: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: 2, target: 0 },
        { kind: "damage", amount: 2, target: 1 },
      ],
    },
  },
});
