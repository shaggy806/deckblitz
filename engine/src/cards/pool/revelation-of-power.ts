import { defineCard } from "../define.js";

// "If it has a counter on it" is asked as the spell resolves, after the +2/+2
// (Yip Yip!'s shape): any kind of counter.
export default defineCard({
  name: "Revelation of Power",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it has a counter on it, it also gains flying and lifelink until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { compare: { op: "gte", n: 1 } } } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
