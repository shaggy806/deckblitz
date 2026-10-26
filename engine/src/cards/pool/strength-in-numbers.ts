import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 19106.
//
// Appeal's shape, X counted over every attacking creature (anyone's) once, as
// it resolves (the ruling).
const X = { countOf: { type: "creature", attacking: true } } as const;

export default defineCard({
  name: "Strength in Numbers",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target creature gains trample and gets +X/+X, where X is the number of attacking creatures.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
    ],
  },
});
