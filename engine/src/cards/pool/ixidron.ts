import { defineCard } from "../define.js";

// EDHREC rank 8119.
//
// "As this creature enters" is part of the replacement (rules 614.1c, 614.12):
// the others are face down before it's there (`AsEntersAction.turnFaceDown`),
// never one entering with it (the ruling).

const ENTERS_TEXT = "As this creature enters, turn all other nontoken creatures face down. (They're 2/2 creatures.)";
const PT_TEXT = "Ixidron's power and toughness are each equal to the number of face-down creatures on the battlefield.";

export default defineCard({
  name: "Ixidron",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", asEnters: { turnFaceDown: { type: "creature", token: false } } },
      text: ENTERS_TEXT,
    },
    {
      // A characteristic-defining ability (rule 604.3): every face-down
      // creature, anyone's.
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "creature", faceDown: true } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
