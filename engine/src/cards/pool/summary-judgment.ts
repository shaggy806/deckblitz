import { defineCard } from "../define.js";

// Ravnica Allegiance. Addendum is asked as the spell resolves, as Return to
// Dust's is (the ruling: "while the spell is resolving"); a copy wasn't cast,
// so it deals 3 (the `cast` clause — the ruling).
const MAIN_PHASE = {
  kind: "all",
  of: [
    { kind: "source", filter: { cast: true } },
    { kind: "your-turn" },
    { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
  ],
} as const;

export default defineCard({
  name: "Summary Judgment",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Summary Judgment deals 3 damage to target tapped creature.\nAddendum — If you cast this spell during your main phase, it deals 5 damage instead.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "conditional",
    condition: MAIN_PHASE,
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});
