import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 25665.
// A preparation card (rule 722): its prepare spell is Peer Review.

const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const SURVEIL_TEXT = "When this creature enters, surveil 1.";

export default defineCard({
  name: "Semester Foreseer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  prepareSpell: "Peer Review",
  text: `${ENTERS_TEXT}\n${SURVEIL_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
