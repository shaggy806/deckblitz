import { defineCard } from "../define.js";

// Torment. EDHREC rank 15837. Midnight Covenant's granted pump and False
// Demise's return: the trigger is the Aura's, reading its host as it last
// existed (rule 603.10a); "that card" comes back only if it's still the card
// that died — a token never does (rule 400.7).

const PUMP_TEXT = "{B}: This creature gets +1/+1 until end of turn.";
const RETURN_TEXT = "When enchanted creature dies, return that card to the battlefield under your control.";

export default defineCard({
  name: "Shade's Form",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${PUMP_TEXT}"\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: `Enchanted creature has "${PUMP_TEXT}"`,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
