import { defineCard } from "../define.js";

const PUMP_TEXT = "Creatures you control that are enchanted get +1/+1.";
const BLOCKED_TEXT =
  "Whenever a creature you control that's enchanted becomes blocked, it gets +1/+1 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Beastmaster's Magemark",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP_TEXT}\n${BLOCKED_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", enchanted: true } },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature", enchanted: true } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { blockersOf: "trigger-object" },
        toughness: { blockersOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
