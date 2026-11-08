import { defineCard } from "../define.js";

// Skullcrack's rules, then 3 damage to any target. A shield counter's
// prevention prevents none of it (rule 615.12), but the counter is still
// removed, as the reminder says.
export default defineCard({
  name: "Call In a Professional",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Players can't gain life this turn. Damage can't be prevented this turn. Call In a Professional deals 3 damage to any target. (Shield counters don't prevent this damage as they're removed.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "timed-static",
        duration: "end-of-turn",
        static: [
          {
            affects: { scope: "self" },
            replacement: { event: "would-gain-life", who: "any-player", prevent: true },
            text: "Players can't gain life this turn.",
          },
        ],
        text: "Players can't gain life this turn.",
      },
      { kind: "damage-cant-be-prevented" },
      { kind: "damage", amount: 3, target: 0 },
    ],
  },
});
