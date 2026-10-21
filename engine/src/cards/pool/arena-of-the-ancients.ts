import { defineCard } from "../define.js";

// Legends. EDHREC rank 18889.
const UNTAP_TEXT = "Legendary creatures don't untap during their controllers' untap steps.";
const ENTER_TEXT = "When this artifact enters, tap all legendary creatures.";

export default defineCard({
  name: "Arena of the Ancients",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${UNTAP_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", supertype: "legendary" } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", supertype: "legendary" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
