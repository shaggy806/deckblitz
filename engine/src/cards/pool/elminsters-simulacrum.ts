import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 6881.
//
// "For each opponent, … up to one target creature that player controls": one
// optional slot per opponent seat (Hammers of Moradin's shape); a seat with
// no target chosen, or none in the game, is a hole its copy skips. The
// copies are yours ("you create" — Hate Mirage's `who: "you"`), and they're
// one instruction, so they enter together (`simultaneous`).

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});
const copyOf = (slot: number) => ({ kind: "create-token-copy", of: slot, count: 1, who: "you" }) as const;

export default defineCard({
  name: "Elminster's Simulacrum",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "For each opponent, you create a token that's a copy of up to one target creature that player controls.",
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: { kind: "sequence", simultaneous: true, effects: [copyOf(0), copyOf(1), copyOf(2)] },
});
