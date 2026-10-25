import { defineCard } from "../define.js";

// EDHREC rank 30788. Only the creatures you control as it resolves are
// affected (the ruling) — `modify-pt-all` and `grant-keyword-all` read the
// battlefield then. Kicked, the +2/+2 and first strike replace the +1/+1.
export default defineCard({
  name: "Bold Defense",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {3}{W} (You may pay an additional {3}{W} as you cast this spell.)\nCreatures you control get +1/+1 until end of turn. If this spell was kicked, instead creatures you control get +2/+2 and gain first strike until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
  kicker: {
    cost: "{3}{W}",
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
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "first-strike",
          duration: "end-of-turn",
        },
      ],
    },
  },
});
