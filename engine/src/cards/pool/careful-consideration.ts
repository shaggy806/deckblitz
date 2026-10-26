import { defineCard } from "../define.js";

export default defineCard({
  name: "Careful Consideration",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player draws four cards, then discards three cards. If you cast this spell during your main phase, instead that player draws four cards, then discards two cards.",
  targets: ["player"],
  // "If you cast this spell": a copy wasn't cast, so it discards three (the
  // ruling) — the addendum shape's `cast` clause.
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "source", filter: { cast: true } },
        { kind: "your-turn" },
        { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
      ],
    },
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 4, target: 0 },
        { kind: "discard", target: 0, amount: 2 },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 4, target: 0 },
        { kind: "discard", target: 0, amount: 3 },
      ],
    },
  },
});
