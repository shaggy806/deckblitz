import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 28895.

const TEXT = "{3}, {T} or {G}, {T}: Target creature gains trample until end of turn.";

const TRAMPLE: EffectSpec = { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" };

export default defineCard({
  name: "Heartwood Shard",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  // One ability with a choice of two costs, written as two activations, one
  // per cost: either is paid, never both (the ruling — Crystal Shard's shape).
  activated: [
    { cost: { mana: "{3}", tap: true }, targets: ["creature"], effect: TRAMPLE, resolve: null, text: TEXT },
    { cost: { mana: "{G}", tap: true }, targets: ["creature"], effect: TRAMPLE, resolve: null, text: TEXT },
  ],
});
