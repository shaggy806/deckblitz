import { defineCard } from "../define.js";

// EDHREC rank 15370.

export default defineCard({
  name: "Rapier Wit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap target creature. If it's your turn, put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "your-turn" },
        then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
