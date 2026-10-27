import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Prophecy (PCY). EDHREC rank 23668.
//
// Daemogoth Titan's shape: one trigger per event, each sacrificing a land of the
// controller's choice.

const TEXT = "Whenever this creature attacks or blocks, sacrifice a land.";
const SACRIFICE: EffectSpec = { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 };

export default defineCard({
  name: "Lesser Gargadon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: SACRIFICE, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SACRIFICE, resolve: null, text: TEXT },
  ],
});
