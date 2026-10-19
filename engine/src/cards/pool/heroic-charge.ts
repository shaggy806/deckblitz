import { defineCard } from "../define.js";

// EDHREC rank 24397.
//
// "Those creatures" are the ones the pump affected: both `-all` effects pick
// their creatures in the same resolution, so they're the same set (rule
// 611.2c).

const PUMP = {
  kind: "modify-pt-all",
  filter: { type: "creature", controlledBy: "you" },
  power: 2,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Heroic Charge",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\nCreatures you control get +2/+1 until end of turn. If this spell was kicked, those creatures also gain trample until end of turn.",
  targets: [],
  effect: PUMP,
  kicker: {
    cost: "{1}{R}",
    effect: {
      kind: "sequence",
      effects: [
        PUMP,
        {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "trample",
          duration: "end-of-turn",
        },
      ],
    },
  },
});
