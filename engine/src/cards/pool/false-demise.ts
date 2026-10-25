import { defineCard } from "../define.js";

// Alliances. EDHREC rank 19642.
//
// Minion's Return's shape: the trigger is the Aura's, reading its host as it
// last existed (rule 603.10a), and "that card" comes back only if it's still
// the card that died — a token never does (rule 400.7).

const TEXT = "When enchanted creature dies, return that card to the battlefield under your control.";

export default defineCard({
  name: "False Demise",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
