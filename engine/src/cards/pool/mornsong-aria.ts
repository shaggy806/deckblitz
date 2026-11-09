import { defineCard } from "../define.js";

const CANT_TEXT = "Players can't draw cards or gain life.";
const STEP_TEXT =
  "At the beginning of each player's draw step, that player loses 3 life, searches their library for a card, puts it into their hand, then shuffles.";

export default defineCard({
  name: "Mornsong Aria",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  supertypes: ["legendary"],
  text: `${CANT_TEXT}\n${STEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "draw", who: "each-player", perTurn: 0 }],
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: CANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "active-player" },
          {
            kind: "for-each-player",
            who: "active-player",
            effect: { kind: "search-library", who: "that-player", filter: {}, destination: "hand", min: 1, max: 1 },
          },
        ],
      },
      resolve: null,
      text: STEP_TEXT,
    },
  ],
});
