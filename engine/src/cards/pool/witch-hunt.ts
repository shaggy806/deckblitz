import { defineCard } from "../define.js";

const CANT_GAIN = "Players can't gain life.";
const DAMAGE = "At the beginning of your upkeep, this enchantment deals 4 damage to you.";
const PASSES = "At the beginning of your end step, target opponent chosen at random gains control of this enchantment.";

export default defineCard({
  name: "Witch Hunt",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${CANT_GAIN}\n${DAMAGE}\n${PASSES}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: CANT_GAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "you" },
      resolve: null,
      text: DAMAGE,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      targetsAtRandom: true,
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: PASSES,
    },
  ],
});
