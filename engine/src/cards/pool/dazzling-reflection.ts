import { defineCard } from "../define.js";

// The life comes as it resolves, not as the damage is prevented (the ruling).
export default defineCard({
  name: "Dazzling Reflection",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain life equal to target creature's power. The next time that creature would deal damage this turn, prevent that damage.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { powerOf: 0 } },
      { kind: "damage-rule", by: { target: 0 }, amount: "next-time" },
    ],
  },
});
