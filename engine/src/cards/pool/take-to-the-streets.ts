import { defineCard } from "../define.js";

export default defineCard({
  name: "Take to the Streets",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Creatures you control get +2/+2 until end of turn. Citizens you control get an additional +1/+1 and gain vigilance until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      {
        kind: "modify-pt-all",
        filter: { subtype: "Citizen", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { subtype: "Citizen", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
    ],
  },
});
