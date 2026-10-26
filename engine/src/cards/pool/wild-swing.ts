import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 25539. Shadowmoor.
//
// Rulings:
//   [2008-05-01] You target three permanents as you cast Wild Swing. You don’t randomly choose
//     which one will be destroyed until Wild Swing resolves. If one of those permanents has become
//     an illegal target by then, you randomly choose between the other two. If two of those
//     permanents have become illegal targets by then, there is no random choice — the remaining
//     permanent is destroyed.
//   [2008-05-01] As Wild Swing resolves, there is no time to react between the time a permanent is
//     chosen at random and the time it’s destroyed.
//
// Three distinct target slots, then a resolution-time `random` modal (Crystalline Giant's shape):
// one mode per target, each eligible only while its slot still holds a legal target (a slot found
// illegal on resolution is blank, so its `target` condition fails) — so the pick is among the
// legal ones only, and with one left there is no real choice.

const NONENCHANTMENT: TargetSpec = { kind: "permanent", filter: { notTypes: ["enchantment"] } };

export default defineCard({
  name: "Wild Swing",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose three target nonenchantment permanents. Destroy one of them at random.",
  targets: [
    NONENCHANTMENT,
    { kind: "other", of: NONENCHANTMENT, than: { slots: [0] } },
    { kind: "other", of: NONENCHANTMENT, than: { slots: [0, 1] } },
  ],
  effect: {
    kind: "modal",
    random: true,
    minModes: 1,
    maxModes: 1,
    modes: [0, 1, 2].map((slot) => ({
      text: `Destroy target ${slot + 1}`,
      onlyIf: { kind: "target" as const, index: slot, filter: {} },
      effect: { kind: "destroy" as const, target: slot },
    })),
  },
});
