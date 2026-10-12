import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindstab",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 4, cost: "{B}" },
  text: "Target player discards three cards.\nSuspend 4—{B} (Rather than cast this card from your hand, you may pay {B} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 3 },
});
