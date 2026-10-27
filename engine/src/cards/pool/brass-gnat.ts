import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 23450. Brass Man's shape.

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {1}. If you do, untap this creature.";

export default defineCard({
  name: "Brass Gnat",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${UNTAP_STEP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to untap Brass Gnat?",
        cost: "{1}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
