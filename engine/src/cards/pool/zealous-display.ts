import { defineCard } from "../define.js";

// EDHREC rank 17264. "Those creatures" are the ones that got +2/+0: the
// creatures you control as it resolves, untapped in the same resolution.

export default defineCard({
  name: "Zealous Display",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +2/+0 until end of turn. If it's not your turn, untap those creatures.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "your-turn" } },
        then: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      },
    ],
  },
});
