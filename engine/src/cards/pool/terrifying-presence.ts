import { defineCard } from "../define.js";

// Ruling: with its target illegal as it resolves, nothing is prevented (a
// spell whose only target is illegal doesn't resolve).

export default defineCard({
  name: "Terrifying Presence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by creatures other than target creature this turn.",
  targets: ["creature"],
  effect: { kind: "damage-rule", by: { filter: { type: "creature" }, exceptTarget: 0 }, combat: true },
});
