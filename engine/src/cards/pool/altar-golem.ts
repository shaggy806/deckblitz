import { defineCard } from "../define.js";

// EDHREC rank 20391.

const PT_TEXT = "Altar Golem's power and toughness are each equal to the number of creatures on the battlefield.";
const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UNTAP_TEXT = "Tap five untapped creatures you control: Untap this creature.";

export default defineCard({
  name: "Altar Golem",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${UNTAP_STEP_TEXT}\n${UNTAP_TEXT}`,
  static: [
    {
      // A characteristic-defining ability (rule 604.3) counting every
      // creature on the battlefield, itself included.
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "creature" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    { affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT },
  ],
  activated: [
    {
      // Any five untapped creatures you control, this one included if it's
      // untapped (rule 602.2b) — Sandsower's shape.
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 5, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
