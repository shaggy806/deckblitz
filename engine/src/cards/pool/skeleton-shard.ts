import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 14960.
//
// Rulings:
//   [2004-10-04] You can pay either of the two costs (but not both at the same time) to activate
//     the ability.

const TEXT = "{3}, {T} or {B}, {T}: Return target artifact creature card from your graveyard to your hand.";
const TARGET: TargetSpec = { kind: "card-in-graveyard", whose: "you", filter: { types: ["artifact", "creature"] } };
const RETURN: EffectSpec = { kind: "return-to-hand", target: 0, from: "graveyard" };

export default defineCard({
  name: "Skeleton Shard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  // One ability with a choice of two costs, written as two activations, one
  // per cost: either is paid, never both (the ruling) — Crystal Shard's shape.
  activated: [
    { cost: { mana: "{3}", tap: true }, targets: [TARGET], effect: RETURN, resolve: null, text: TEXT },
    { cost: { mana: "{B}", tap: true }, targets: [TARGET], effect: RETURN, resolve: null, text: TEXT },
  ],
});
