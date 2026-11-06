import { defineCard } from "../define.js";

// EDHREC rank 28545.

export default defineCard({
  name: "Cryogenic Stasis",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Tap target creature and put a stun counter on it. (If a permanent with a stun counter would become untapped, " +
    "remove one from it instead.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
