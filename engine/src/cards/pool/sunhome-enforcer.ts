import { defineCard } from "../define.js";

const LIFE_TEXT = "Whenever this creature deals combat damage, you gain that much life.";
const PUMP_TEXT = "{1}{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Sunhome Enforcer",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 2,
  toughness: 4,
  text: `${LIFE_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      // No recipient named: once per combat damage event, for the total (rule 603.2c).
      trigger: { on: "deals-damage", who: "self", combat: true },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
