import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 18554. Assassinate, with Into the
// Roil's kicked rider.
const TAPPED_CREATURE = { kind: "permanent", filter: { tapped: true, type: "creature" } } as const;

export default defineCard({
  name: "Runic Shot",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Kicker {U} (You may pay an additional {U} as you cast this spell.)\nDestroy target tapped creature. If this spell was kicked, scry 2.",
  targets: [TAPPED_CREATURE],
  effect: { kind: "destroy", target: 0 },
  kicker: {
    cost: "{U}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "scry", amount: 2 },
      ],
    },
  },
});
