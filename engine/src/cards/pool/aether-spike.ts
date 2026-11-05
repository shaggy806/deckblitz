import { defineCard } from "../define.js";

// EDHREC rank 7517. "Any amount" applies its effect at X 0 when declined: the
// spell is countered unless its controller pays {0} (the ruling).
export default defineCard({
  name: "Aether Spike",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose target spell. You get {E}{E} (two energy counters), then you may pay any amount of {E}. Counter that spell unless its controller pays {1} for each {E} paid this way.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 2 },
      {
        kind: "may",
        prompt: "Pay any amount of {E}? That spell is countered unless its controller pays {1} for each.",
        costEnergyX: "any",
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ payGeneric: "x", text: "Pay {X}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
    ],
  },
});
