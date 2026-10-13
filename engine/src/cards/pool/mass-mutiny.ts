import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 7075.
// Molten Primordial's text as a sorcery: one optional slot per opponent's
// seat, each bound to "that player" (the errata's "up to one"; castable with
// none chosen, and an untapped creature may be chosen — the rulings). Auras
// and Equipment on a stolen creature stay with their controllers.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

const steal = (slot: number): EffectSpec[] => [
  { kind: "gain-control", target: slot, untilEndOfTurn: true },
  { kind: "untap", target: slot },
  { kind: "grant-keyword", target: slot, keyword: "haste", duration: "end-of-turn" },
];

export default defineCard({
  name: "Mass Mutiny",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "For each opponent, gain control of up to one target creature that player controls until end of turn. Untap those creatures. They gain haste until end of turn.",
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: { kind: "sequence", effects: [...steal(0), ...steal(1), ...steal(2)] },
});
