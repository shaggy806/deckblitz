import { defineCard } from "../define.js";

// "Skips that draw instead": a `would-draw` replacement whose effect is
// nothing (rule 614.1a) — no card drawn, no draw trigger, and it applies with
// an empty library too (614.11), so nobody loses for drawing from one. Beside
// another replacement of the draw (a dredge), the drawing player chooses
// which applies (616.1).

const DRAW = "If a player would draw a card, that player skips that draw instead.";
const END = "At the beginning of each end step, each player sacrifices a permanent of their choice unless they discard a card.";

export default defineCard({
  name: "Possessed Portal",
  manaCost: "{8}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW}\n${END}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "any-player", instead: { effect: { kind: "sequence", effects: [] } } },
      text: DRAW,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDidnt: { kind: "sacrifice", who: "that-player", filter: {}, count: 1 },
      },
      resolve: null,
      text: END,
    },
  ],
});
