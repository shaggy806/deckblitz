import { defineCard } from "../define.js";

const FACES = ["Give // Take", "Give", "Take"];

// The right half of Give // Take (see give-take.ts). "That many" is the
// counters removed this way.
export default defineCard({
  name: "Take",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Remove all +1/+1 counters from target creature you control. Draw that many cards.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-counter", target: 0, counter: "+1/+1", amount: "all" },
      { kind: "draw", amount: { thisWay: "counters-removed" } },
    ],
  },
  faces: FACES,
  split: true,
});
