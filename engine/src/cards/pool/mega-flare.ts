import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 17701.
//
// Rulings:
//   [2025-06-13] Use the greatest power among creatures you control as Mega Flare resolves to
//     determine how much damage is dealt.
//
// - "For each opponent, choose up to one target creature that player controls":
//   one optional slot per opponent seat (Windgrace's Judgment's shape).
// - The damage is Go Ninja Go's amount, the greatest power read as the spell
//   resolves — after the kicked Dragon is made, so a 6/6 counts (the order the
//   card prints its clauses). One `simultaneous` sequence: one damage event.
// - Kicked, the `kicker.effect` is the whole kicked resolution: the Dragon,
//   then the damage, over the same targets.
const KICKER_TEXT = "Kicker {3}{R}{R}";
const DRAGON_TEXT = "If this spell was kicked, create a 6/6 red Dragon creature token with flying.";
const DAMAGE_TEXT =
  "For each opponent, choose up to one target creature that player controls. Mega Flare deals damage equal to the greatest power among creatures you control to each of the chosen creatures.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

const GREATEST = { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } } as const;

const FLARE: EffectSpec = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "damage", amount: GREATEST, target: 0 },
    { kind: "damage", amount: GREATEST, target: 1 },
    { kind: "damage", amount: GREATEST, target: 2 },
  ],
};

export default defineCard({
  name: "Mega Flare",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${KICKER_TEXT}\n${DRAGON_TEXT}\n${DAMAGE_TEXT}`,
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: FLARE,
  kicker: {
    cost: "{3}{R}{R}",
    effect: {
      kind: "sequence",
      effects: [{ kind: "create-token", token: "6/6 Dragon Token", count: 1 }, FLARE],
    },
  },
});
