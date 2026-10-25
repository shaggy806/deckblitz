import { defineCard } from "../define.js";

const MONSTROSITY_TEXT =
  "{5}{R}{R}: Monstrosity 1. (If this creature isn't monstrous, put a +1/+1 counter on it and it becomes monstrous.)";
const DAMAGE_TEXT = "When this creature becomes monstrous, it deals 2 damage to each opponent and each creature they control.";

export default defineCard({
  name: "Wildfire Cerberus",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 3,
  text: `${MONSTROSITY_TEXT}\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 1 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "damage-all", filter: { type: "creature" }, whose: "each-opponent", amount: 2 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
