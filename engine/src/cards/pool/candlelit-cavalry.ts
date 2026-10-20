import { defineCard } from "../define.js";

// EDHREC rank 27475.

export default defineCard({
  name: "Candlelit Cavalry",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 5,
  toughness: 5,
  text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains trample until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains trample until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
