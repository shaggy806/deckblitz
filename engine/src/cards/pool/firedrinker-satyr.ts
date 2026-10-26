import { defineCard } from "../define.js";

const DAMAGED_TEXT = "Whenever this creature is dealt damage, it deals that much damage to you.";
const PUMP_TEXT = "{1}{R}: This creature gets +1/+0 until end of turn and deals 1 damage to you.";

export default defineCard({
  name: "Firedrinker Satyr",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Shaman"],
  power: 2,
  toughness: 1,
  text: `${DAMAGED_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "you" },
      resolve: null,
      text: DAMAGED_TEXT,
    },
  ],
});
