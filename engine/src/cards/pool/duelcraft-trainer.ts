import { defineCard } from "../define.js";

// EDHREC rank 24853.

export default defineCard({
  name: "Duelcraft Trainer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nCoven — At the beginning of combat on your turn, if you control three or more creatures with different powers, target creature you control gains double strike until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, target creature you control gains double strike until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
