import { defineCard } from "../define.js";

// Ruling: halving a negative life total halves 0 — the signed half is clamped
// to a loss of 0, so the life total stays where it is.
export default defineCard({
  name: "Ebonblade Reaper",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{3}{B}{B}" },
  text: "Whenever this creature attacks, you lose half your life, rounded up.\nWhenever this creature deals combat damage to a player, that player loses half their life, rounded up.\nMorph {3}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { half: { lifeTotal: "you" }, round: "up" } },
      resolve: null,
      text: "Whenever this creature attacks, you lose half your life, rounded up.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "trigger-player",
        amount: { half: { lifeTotal: "each" }, round: "up" },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player loses half their life, rounded up.",
    },
  ],
});
