import { defineCard } from "../define.js";

// EDHREC rank 18266.
//
// Rulings:
//   The poison counter goes to whoever controls the artifact as the ability
//     resolves (or last controlled it, if it's gone) — Corrupted Roots's
//     `trigger-controller`.
//   It may enchant an already-tapped artifact; it triggers only when the
//     artifact becomes tapped.

const TEXT = "Whenever enchanted artifact becomes tapped, its controller gets a poison counter.";

export default defineCard({
  name: "Relic Putrescence",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
