import { defineCard } from "../define.js";

// "Each discard their hands, then draw seven cards" is two instructions: every
// target discards, and only then does every target draw.
export default defineCard({
  name: "Wheel and Deal",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Any number of target opponents each discard their hands, then draw seven cards.\nDraw a card.",
  targets: [{ kind: "any-number", of: "opponent" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "as-player", who: { target: 0 }, effect: { kind: "discard-hand", who: "you" } },
      },
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "as-player", who: { target: 0 }, effect: { kind: "draw", amount: 7 } },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
