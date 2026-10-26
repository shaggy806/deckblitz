import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 10212.
//
// Arrester's Zeal's addendum test: a spell cast in your main phase resolves in
// that phase, so "it was cast, and it's now your main phase" is the same
// question. A copy wasn't cast, so it gives only +2/+2 (the ruling).
export default defineCard({
  name: "Might of Old Krosa",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If you cast this spell during your main phase, that creature gets +4/+4 until end of turn instead.",
  targets: ["creature"],
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
    then: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
