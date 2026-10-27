import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 27828.
//
// Rulings:
//   [2004-10-04] You can pay either of the two costs (but not both at the same time) to activate
//     the ability.

const TEXT = "{3}, {T} or {R}, {T}: This artifact deals 1 damage to any target.";
const PING: EffectSpec = { kind: "damage", amount: 1, target: 0 };

export default defineCard({
  name: "Granite Shard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  // One ability with a choice of two costs, written as two activations, one
  // per cost: either is paid, never both (the ruling) — Crystal Shard's shape.
  activated: [
    { cost: { mana: "{3}", tap: true }, targets: ["any-target"], effect: PING, resolve: null, text: TEXT },
    { cost: { mana: "{R}", tap: true }, targets: ["any-target"], effect: PING, resolve: null, text: TEXT },
  ],
});
