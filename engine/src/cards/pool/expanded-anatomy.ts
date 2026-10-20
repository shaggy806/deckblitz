import { defineCard } from "../define.js";

export default defineCard({
  name: "Expanded Anatomy",
  manaCost: "{3}",
  colors: [],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Put two +1/+1 counters on target creature. It gains vigilance until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
});
