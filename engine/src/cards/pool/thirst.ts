import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31632.
//
// Bitter Chill's tap-and-lock, with Earthlink's upkeep "sacrifice unless you
// pay".

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this Aura unless you pay {U}.";

export default defineCard({
  name: "Thirst",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}", text: "Pay {U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
