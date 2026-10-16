import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// Bloomburrow (BLB). EDHREC rank 13436.
// Gift a Food (rule 702.174): the creature is a target only when the gift is promised
// (702.174m — Sazacap's Brew's shape), so unpromised it can be cast without one; promised
// with its target gone, the spell doesn't resolve at all — no Food, no pump (the ruling).
const PUMP = {
  kind: "modify-pt-all",
  filter: { type: "creature", controlledBy: "you" },
  power: 2,
  toughness: 0,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Valley Rally",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Gift a Food (You may promise an opponent a gift as you cast this spell. If you do, they create a Food token before its other effects. It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nCreatures you control get +2/+0 until end of turn. If the gift was promised, target creature you control gains first strike until end of turn.",
  targets: [],
  effect: PUMP,
  kicker: {
    ...GIFT_KICKER,
    targets: ["creature-you-control"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "food" },
        PUMP,
        { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      ],
    },
  },
});
