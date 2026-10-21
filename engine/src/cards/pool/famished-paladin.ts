import { defineCard } from "../define.js";

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const GAIN_TEXT = "Whenever you gain life, untap this creature.";

export default defineCard({
  name: "Famished Paladin",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 3,
  text: `${UNTAP_STEP_TEXT}\n${GAIN_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
