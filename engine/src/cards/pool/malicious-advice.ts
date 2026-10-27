import { defineCard } from "../define.js";

export default defineCard({
  name: "Malicious Advice",
  manaCost: "{X}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Tap X target artifacts, creatures, and/or lands. You lose X life.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      { kind: "lose-life", amount: "x" },
    ],
  },
});
