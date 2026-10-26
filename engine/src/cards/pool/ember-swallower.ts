import { defineCard } from "../define.js";

const MONSTROSITY_TEXT =
  "{5}{R}{R}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const SACRIFICE_TEXT = "When this creature becomes monstrous, each player sacrifices three lands of their choice.";

export default defineCard({
  name: "Ember Swallower",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 5,
  text: `${MONSTROSITY_TEXT}\n${SACRIFICE_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: 3 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
