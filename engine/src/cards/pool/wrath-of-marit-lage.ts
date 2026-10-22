import { defineCard } from "../define.js";

// Ice Age. Arena of the Ancients' shape, over red creatures.

const ENTER_TEXT = "When this enchantment enters, tap all red creatures.";
const UNTAP_TEXT = "Red creatures don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Wrath of Marit Lage",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", colors: ["R"] } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"] } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
