import { defineCard } from "../define.js";

// A target gone illegal by resolution gets nothing; the other still does
// (its ruling).
export default defineCard({
  name: "Press the Advantage",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Up to two target creatures each get +2/+2 and gain trample until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
