import { defineCard } from "../define.js";

// EDHREC rank 14843. The damage is dealt whether or not {X} was paid (the
// ruling) — Ionize's "that spell's controller", after Clash of Wills' punisher.

export default defineCard({
  name: "Mindswipe",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}. Mindswipe deals X damage to that spell's controller.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ payGeneric: "x", text: "Pay {X}." }], otherwise: { kind: "counter", target: 0 } },
      { kind: "damage", amount: "x", toControllerOfTarget: 0 },
    ],
  },
});
