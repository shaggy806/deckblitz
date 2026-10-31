import { defineCard } from "../define.js";

// A rule for the turn over the creatures you control as damage is assigned —
// one that comes under your control later too, since it changes no
// characteristic (rule 611.2c) — each one's choice made on its own.
export default defineCard({
  name: "Predatory Focus",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may have creatures you control assign their combat damage this turn as though they weren't blocked.",
  effect: {
    kind: "assign-as-though-unblocked",
    filter: { type: "creature", controlledBy: "you" },
    optional: true,
  },
});
