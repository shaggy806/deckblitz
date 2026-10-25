import { defineCard } from "../define.js";

// EDHREC rank 11286. An artifact creature gains trample as well as the
// +3/+3, not instead of it (the ruling); checked as it resolves.

export default defineCard({
  name: "Built to Smash",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target attacking creature gets +3/+3 until end of turn. If it's an artifact creature, it gains trample until end of turn.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { types: ["artifact", "creature"] } },
        then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      },
    ],
  },
});
