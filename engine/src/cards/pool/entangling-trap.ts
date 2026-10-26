import { defineCard } from "../define.js";

// EDHREC rank 31402.

export default defineCard({
  name: "Entangling Trap",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever you clash, tap target creature an opponent controls. If you won, that creature doesn't untap during its controller's next untap step. (This ability triggers after the clash ends.)",
  triggered: [
    {
      trigger: { on: "clashes", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "trigger-value", compare: { op: "gte", n: 1 } },
            then: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
          },
        ],
      },
      resolve: null,
      text: "Whenever you clash, tap target creature an opponent controls. If you won, that creature doesn't untap during its controller's next untap step.",
    },
  ],
});
