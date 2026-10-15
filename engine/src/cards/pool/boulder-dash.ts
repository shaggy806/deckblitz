import { defineCard } from "../define.js";

// EDHREC rank 20698.
//
// Two different targets (rule 115.3 — "any other target"), dealt their
// damage at once (Self-Destruct's simultaneous sequence). One found illegal
// as it resolves is skipped and the other is still dealt its damage (608.2b).

export default defineCard({
  name: "Boulder Dash",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Boulder Dash deals 2 damage to any target and 1 damage to any other target.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 1, target: 1 },
    ],
  },
});
