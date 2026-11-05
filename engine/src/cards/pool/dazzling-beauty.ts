import { defineCard } from "../define.js";

// EDHREC rank 29407.

export default defineCard({
  name: "Dazzling Beauty",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare blockers step.\nTarget unblocked attacking creature becomes blocked. (This spell works on creatures that can't be blocked.)\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { unblocked: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-blocked", target: 0 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers"] },
});
