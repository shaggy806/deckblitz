import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Arc of Fortune.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Variable Chaser",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  prepareSpell: "Arc of Fortune",
  text: `Flying, prowess\n${ENTERS_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess — whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.",
    },
  ],
});
