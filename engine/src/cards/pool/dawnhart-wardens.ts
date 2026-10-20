import { defineCard } from "../define.js";

// EDHREC rank 21482.

export default defineCard({
  name: "Dawnhart Wardens",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nCoven — At the beginning of combat on your turn, if you control three or more creatures with different powers, creatures you control get +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, creatures you control get +1/+0 until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
