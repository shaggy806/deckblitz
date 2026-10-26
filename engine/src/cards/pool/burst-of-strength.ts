import { defineCard } from "../define.js";

// EDHREC rank 13633. Dragonscale Boon at one counter.
//
// Rulings:
//   [2013-01-24] Burst of Strength can target and put a +1/+1 counter on a creature that's
//     already untapped.

export default defineCard({
  name: "Burst of Strength",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature and untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "untap", target: 0 },
    ],
  },
});
