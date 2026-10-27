import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 31463.

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {4}. If you do, untap this creature.";

export default defineCard({
  name: "Goblin Dirigible",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UNTAP_STEP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4} to untap Goblin Dirigible?",
        cost: "{4}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
