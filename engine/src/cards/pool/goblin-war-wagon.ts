import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 30710.

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {2}. If you do, untap this creature.";

export default defineCard({
  name: "Goblin War Wagon",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 3,
  toughness: 3,
  text: `${UNTAP_STEP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to untap Goblin War Wagon?",
        cost: "{2}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
