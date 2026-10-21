import { defineCard } from "../define.js";

// Ravnica Allegiance. Addendum is asked as the spell resolves, as Return to
// Dust's is (the ruling: "while the spell is resolving"); a copy wasn't cast,
// so it gets no addendum (the `cast` clause — the ruling). An already-tapped
// target still doesn't untap (the ruling — `doesntUntapNext` marks it either
// way). An illegal target means no draw either (the ruling).
const MAIN_PHASE = {
  kind: "all",
  of: [
    { kind: "source", filter: { cast: true } },
    { kind: "your-turn" },
    { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
  ],
} as const;

export default defineCard({
  name: "Code of Constraint",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Target creature gets -4/-0 until end of turn.\nDraw a card.\nAddendum — If you cast this spell during your main phase, tap that creature and it doesn't untap during its controller's next untap step.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: MAIN_PHASE,
        then: { kind: "tap", target: 0, doesntUntapNext: true },
      },
    ],
  },
});
