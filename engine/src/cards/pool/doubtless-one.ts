import { defineCard } from "../define.js";

// EDHREC rank 21733. A characteristic-defining ability (rule 604.3) counting
// every Cleric on the battlefield, itself included; Kjeldoran Gargoyle's
// lifelink-like trigger.

const PT_TEXT = "Doubtless One's power and toughness are each equal to the number of Clerics on the battlefield.";
const DAMAGE_TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "Doubtless One",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cleric", "Avatar"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Cleric" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
