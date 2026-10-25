import { defineCard } from "../define.js";

export default defineCard({
  name: "War Flare",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Creatures you control get +2/+1 until end of turn. Untap those creatures.",
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
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
    ],
  },
});
