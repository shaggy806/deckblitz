import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, this enchantment deals 1 damage to each opponent and you gain 1 life.";
const SAC_TEXT = "{5}{B}, Sacrifice this enchantment: It deals 4 damage to target opponent and you gain 4 life.";

export default defineCard({
  name: "Ill-Gotten Inheritance",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: 4 },
          { kind: "gain-life", amount: 4 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
