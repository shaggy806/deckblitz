import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 16260.
//
// The count is read as the cast trigger resolves: each kind of counter (rule
// 122.1) on any permanent you control then, however many of it — a shield
// counter on one creature and two +1/+1 counters on another are two kinds.
// Counters on players (poison, energy) aren't among permanents.

const COPY_TEXT =
  "When you cast this spell, copy it for each kind of counter among permanents you control. You may choose new targets for the copies.";
const BOUNCE_TEXT = "Return target nonland permanent to its owner's hand.";

const COUNTER_KINDS: EffectAmount = { aggregate: "distinct", of: "counter-kind", filter: { controlledBy: "you" } };

export default defineCard({
  name: "Storm of Forms",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${COPY_TEXT}\n${BOUNCE_TEXT}`,
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: COUNTER_KINDS },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
