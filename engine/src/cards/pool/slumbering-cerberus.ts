import { defineCard } from "../define.js";

const UNTAP_TEXT = "This creature doesn't untap during your untap step.";
const MORBID_TEXT = "Morbid — At the beginning of each end step, if a creature died this turn, untap this creature.";

export default defineCard({
  name: "Slumbering Cerberus",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${MORBID_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: MORBID_TEXT,
    },
  ],
});
