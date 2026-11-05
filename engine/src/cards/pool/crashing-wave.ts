import { defineCard } from "../define.js";

// EDHREC rank 8385. The stun counters are distributed as it resolves, among any
// tapped creatures your opponents control, not only those it tapped (the ruling).
export default defineCard({
  name: "Crashing Wave",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, waterbend {X}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nTap up to X target creatures, then distribute three stun counters among any number of tapped creatures your opponents control. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  additionalCost: { waterbend: "x" },
  targets: [{ kind: "any-number", of: "creature", min: 0, max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      {
        kind: "counters-distributed",
        counter: "stun",
        total: 3,
        filter: { type: "creature", tapped: true, controlledBy: "opponent" },
        among: "tapped creatures your opponents control",
      },
    ],
  },
});
