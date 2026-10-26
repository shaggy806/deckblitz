import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 10281.
//
// Champion a Faerie (rule 702.72): the `champion` helper's two linked
// triggers. "When a Faerie is championed with this creature" (702.72c) is
// the helper's `onChampioned`: it triggers as the Faerie is exiled, and
// chooses its target player then.

const CHAMPIONED_TEXT = "When a Faerie is championed with this creature, tap all lands target player controls.";

export default defineCard({
  name: "Mistbind Clique",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\nChampion a Faerie (When this enters, sacrifice it unless you exile another Faerie you control. When this leaves the battlefield, that card returns to the battlefield.)\n${CHAMPIONED_TEXT}`,
  triggered: champion({ subtype: "Faerie" }, "a Faerie", {
    targets: ["player"],
    effect: { kind: "tap-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
    text: CHAMPIONED_TEXT,
  }),
});
