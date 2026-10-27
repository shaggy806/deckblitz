import { defineCard } from "../define.js";

// EDHREC rank 28266.

export default defineCard({
  name: "Haunting Hymn",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player discards two cards. If you cast this spell during your main phase, that player discards four cards instead.",
  targets: ["player"],
  // Might of Old Krosa's shape: a spell cast in your main phase resolves in it.
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "source", filter: { cast: true } },
        { kind: "your-turn" },
        { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
      ],
    },
    then: { kind: "discard", target: 0, amount: 4 },
    else: { kind: "discard", target: 0, amount: 2 },
  },
});
