import { defineCard } from "../define.js";

export default defineCard({
  name: "Run Amok",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target attacking creature gets +3/+3 and gains trample until end of turn.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
