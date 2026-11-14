import { defineCard } from "../define.js";

// EDHREC rank 31435. "Each of one or two targets": a required slot and an
// optional second that must be a different target (rule 601.2c — Prismari
// Charm's shape), each dealt 2 damage.

export default defineCard({
  name: "Storm of Steel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Storm of Steel deals 2 damage to each of one or two targets.",
  targets: ["any-target", { kind: "optional", of: { kind: "other", of: "any-target", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
