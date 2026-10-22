import { defineCard } from "../define.js";

// EDHREC rank 25810.
const TAP_TEXT = "When this enchantment enters, tap all Islands.";
const UNTAP_TEXT = "Islands don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Curse of Marit Lage",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TAP_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { subtype: "Island" } },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  static: [{ affects: { scope: "filter", filter: { subtype: "Island" } }, restrictions: ["doesnt-untap"], text: UNTAP_TEXT }],
});
