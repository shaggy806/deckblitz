import { defineCard } from "../define.js";

// EDHREC rank 28094.

export default defineCard({
  name: "Stinging Vitriol",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Stinging Vitriol deals 2 damage to target opponent. That player reveals their hand. You choose a nonland card from it. They discard that card.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } }],
  },
});
