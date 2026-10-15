import { defineCard } from "../define.js";

// EDHREC rank 24246.
const UNTAP_STEP_TEXT = "Traxos doesn't untap during your untap step.";
const CAST_TEXT = "Whenever you cast an artifact or creature spell, untap Traxos.";

export default defineCard({
  name: "Traxos, Scourge Eternal",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Dragon", "Construct"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${UNTAP_STEP_TEXT}\n${CAST_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
