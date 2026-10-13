import { defineCard } from "../define.js";

// EDHREC rank 7132.
// Makes Spirit → "Spirit Token (White-Black)".
//
// Afterlife 1 (rule 702.135a) is the triggered ability "When this permanent
// dies, create a 1/1 white and black Spirit creature token with flying",
// granted to the creatures you control as it resolves (rule 611.2c) — a
// creature that already has afterlife gets a second instance, and each
// triggers (702.135b).

const AFTERLIFE_TEXT =
  "Afterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)";

export default defineCard({
  name: "Afterlife Insurance",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Creatures you control gain afterlife 1 until end of turn. Draw a card. (When a creature with afterlife 1 dies, create a 1/1 white and black Spirit creature token with flying.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-triggered-all",
        filter: { type: "creature", controlledBy: "you" },
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
          resolve: null,
          text: AFTERLIFE_TEXT,
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
