import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 28060.

export default defineCard({
  name: "Sanctified Charge",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +2/+1 until end of turn. White creatures you control also gain first strike until end of turn. (They deal combat damage before creatures without first strike.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", colors: ["W"] },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
    ],
  },
});
