import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 31514.
//
// Rulings:
//   You can pay either of the two costs (but not both at the same time) to activate the ability.

const TEXT = "{3}, {T} or {W}, {T}: Prevent the next 2 damage that would be dealt to any target this turn.";
const PREVENT: EffectSpec = { kind: "prevent-damage", target: 0, amount: 2 };

export default defineCard({
  name: "Pearl Shard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  // One ability with a choice of two costs, written as two activations, one
  // per cost: either is paid, never both (the ruling) — Granite Shard's shape.
  activated: [
    { cost: { mana: "{3}", tap: true }, targets: ["any-target"], effect: PREVENT, resolve: null, text: TEXT },
    { cost: { mana: "{W}", tap: true }, targets: ["any-target"], effect: PREVENT, resolve: null, text: TEXT },
  ],
});
