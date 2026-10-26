import { defineCard } from "../define.js";

// Only Vampires you control as it resolves get the bonus (its ruling): the
// `-all` effects lock in their affected set at resolution (rule 611.2c).
export default defineCard({
  name: "Vampiric Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Vampire creatures you control get +2/+0 and gain first strike until end of turn. (They deal combat damage before creatures without first strike.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Vampire", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Vampire", controlledBy: "you" },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
    ],
  },
});
