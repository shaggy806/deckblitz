import { defineCard } from "../define.js";

// EDHREC rank 25012.

export default defineCard({
  name: "Candlegrove Witch",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains flying until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
