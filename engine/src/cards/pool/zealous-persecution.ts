import { defineCard } from "../define.js";

export default defineCard({
  name: "Zealous Persecution",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Until end of turn, creatures you control get +1/+1 and creatures your opponents control get -1/-1.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
    ],
  },
});
