import { defineCard } from "../define.js";

// EDHREC rank 31209. Each set is the creatures as Battle Frenzy resolves
// (rule 611.2c).
export default defineCard({
  name: "Battle Frenzy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Green creatures you control get +1/+1 until end of turn.\nNongreen creatures you control get +1/+0 until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", colors: ["G"], controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", notColors: ["G"], controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
