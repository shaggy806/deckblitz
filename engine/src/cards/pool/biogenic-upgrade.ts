import { defineCard } from "../define.js";

// EDHREC rank 9085. The distribution is chosen as it's cast, each target
// getting at least one (Defend the Celestus's shape); an illegal target's
// share is lost, and only the legal targets are doubled (rule 608.2b).

export default defineCard({
  name: "Biogenic Upgrade",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Distribute three +1/+1 counters among one, two, or three target creatures, then double the number of +1/+1 counters on each of those creatures.",
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
  divided: { total: 3, slot: 0, of: "+1/+1 counters" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counters-divided", from: 0, counter: "+1/+1" },
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "double-counters", target: 0, counter: "+1/+1" },
        simultaneous: true,
      },
    ],
  },
});
