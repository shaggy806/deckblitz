import { defineCard } from "../define.js";

// EDHREC rank 24702.
// A delayed triggered ability for the rest of the turn (rule 603.7c) with a
// target of its own, chosen as it triggers: each creature you control that
// attacks and isn't blocked — one put onto the battlefield attacking
// included (the ruling) — may deal damage equal to its power to it, and then
// assigns no combat damage this turn (Farrel's Zealot's shape).
const TEXT =
  "Until end of turn, whenever a creature you control attacks and isn't blocked, you may choose to have it deal damage equal to its power to a target creature. If you do, it assigns no combat damage this turn.";

export default defineCard({
  name: "Gaze of Pain",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: {
      whenever: { on: "attacks-unblocked", who: "you-control", filter: { type: "creature" } },
      targets: ["creature"],
    },
    effect: {
      kind: "may",
      prompt: "Have it deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
      effect: { kind: "damage", target: 0, amount: { powerOf: "trigger-object" }, from: "trigger-object" },
      then: { kind: "assigns-no-combat-damage", target: "trigger-object" },
    },
    text: "Whenever a creature you control attacks and isn't blocked, you may choose to have it deal damage equal to its power to a target creature. If you do, it assigns no combat damage this turn.",
  },
});
