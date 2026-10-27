import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "When this creature attacks, up to one target creature defending player controls blocks it this combat if able.";
const SACRIFICE_TEXT = "At the beginning of the end step, sacrifice this creature.";

export default defineCard({
  name: "Impetuous Devils",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 6,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${ATTACK_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature-defending-player-controls" }],
      effect: { kind: "block-if-able", target: 0, attacker: "source", thisCombat: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
