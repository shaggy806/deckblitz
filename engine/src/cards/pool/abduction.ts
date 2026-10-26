import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 18789.
//
// "That card" is the creature card in the graveyard it went to, only while
// it's still there (rule 400.7), returned under its owner's control —
// Ferocity of the Hunt's shape. It may target an untapped creature (its
// ruling): the untap then does nothing.

const UNTAP_TEXT = "When this Aura enters, untap enchanted creature.";
const RETURN_TEXT = "When enchanted creature dies, return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Abduction",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UNTAP_TEXT}\nYou control enchanted creature.\n${RETURN_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
