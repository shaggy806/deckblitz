import { defineCard } from "../define.js";

// Alliances (ALL).
//
// "If Lava Burst would deal damage to a creature, that damage can't be prevented or dealt instead
// to another permanent or player" is the `damage` effect's `toCreaturesUnstoppable` (rules 615.12,
// 614.9): damage to a player or a planeswalker can still be prevented or redirected.

const TEXT =
  "Lava Burst deals X damage to any target. If Lava Burst would deal damage to a creature, that damage can't be prevented or dealt instead to another permanent or player.";

export default defineCard({
  name: "Lava Burst",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["any-target"],
  effect: { kind: "damage", amount: "x", target: 0, toCreaturesUnstoppable: true },
});
