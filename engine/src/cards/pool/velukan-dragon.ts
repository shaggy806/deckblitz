import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 20713.

// One trigger each for attacking and blocking. X is the die's result minus
// 1 (0 to 5), read from the roll just made (`{ roll: "total" }`).
const TEXT =
  "Whenever this creature attacks or blocks, roll a six-sided die. This creature gets +X/+0 until end of turn, where X is the result minus 1.";
const ROLL = {
  kind: "roll-dice",
  sides: 6,
  then: {
    kind: "modify-pt",
    target: "source",
    power: { difference: [{ roll: "total" }, 1] },
    toughness: 0,
    duration: "end-of-turn",
  },
} as const satisfies EffectSpec;

export default defineCard({
  name: "Velukan Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: ROLL, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: ROLL, resolve: null, text: TEXT },
  ],
});
