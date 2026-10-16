import { defineCard } from "../define.js";

// EDHREC rank 10719.
//
// The creatures you control are counted once, as it resolves (the ruling),
// the target among them if it's yours.
export default defineCard({
  name: "Get a Leg Up",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +1/+1 for each creature you control and gains reach.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { countOf: { type: "creature", controlledBy: "you" } },
        toughness: { countOf: { type: "creature", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
    ],
  },
});
