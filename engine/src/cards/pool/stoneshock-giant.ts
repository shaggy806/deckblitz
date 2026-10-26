import { defineCard } from "../define.js";

// The restriction is a turn-wide rule over a filter (rule 611.2c), so it also
// binds creatures that enter or lose flying later this turn (the ruling).
const MONSTROSITY_TEXT =
  "{6}{R}{R}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const CANT_BLOCK_TEXT =
  "When this creature becomes monstrous, creatures without flying your opponents control can't block this turn.";

export default defineCard({
  name: "Stoneshock Giant",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 4,
  text: `${MONSTROSITY_TEXT}\n${CANT_BLOCK_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{R}{R}", tap: false },
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
      effect: {
        kind: "restrict",
        filter: { type: "creature", notKeyword: "flying", controlledBy: "opponent" },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: CANT_BLOCK_TEXT,
    },
  ],
});
