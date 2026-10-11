import { defineCard } from "../define.js";

// EDHREC rank 15618.

// Chandra's Ignition's damage, after the counters: the creature's power is
// read as it deals the damage, so the X counters count.
export default defineCard({
  name: "Nova Flame",
  manaCost: "{X}{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Put X +1/+1 counters on target creature you control. It deals damage equal to its power to each other creature.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
      {
        kind: "damage-all",
        filter: { type: "creature" },
        amount: { powerOf: 0 },
        exceptSource: true,
        from: { target: 0 },
      },
    ],
  },
});
