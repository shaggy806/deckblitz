import { defineCard } from "../define.js";

// EDHREC rank 11980.

export default defineCard({
  name: "Stalwart Pathlighter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\nCoven — At the beginning of combat on your turn, if you control three or more creatures with different powers, creatures you control gain indestructible until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Coven — At the beginning of combat on your turn, if you control three or more creatures with different powers, creatures you control gain indestructible until end of turn.",
      condition: { kind: "coven" },
    },
  ],
});
