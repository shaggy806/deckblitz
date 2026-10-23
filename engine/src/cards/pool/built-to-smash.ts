import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 11286. Run Amok, with the trample only for an
// artifact creature — in addition to the +3/+3 (the ruling).
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
        condition: { kind: "target", index: 0, filter: { type: "artifact" } },
        then: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      },
    ],
  },
});
