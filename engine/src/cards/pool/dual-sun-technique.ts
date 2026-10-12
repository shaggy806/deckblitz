import { defineCard } from "../define.js";

// EDHREC rank 11383.

export default defineCard({
  name: "Dual-Sun Technique",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gains double strike until end of turn. If it has a +1/+1 counter on it, draw a card.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
