import { defineCard } from "../define.js";

// EDHREC rank 27620.

export default defineCard({
  name: "Ritual Guardian",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains lifelink until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, this creature gains lifelink until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
