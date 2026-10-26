import { defineCard } from "../define.js";

export default defineCard({
  name: "Call to Glory",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap all creatures you control. Samurai creatures you control get +1/+1 until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Samurai", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
    ],
  },
});
