import { defineCard } from "../define.js";

// EDHREC rank 26181.
//
// Rulings:
//   Reworded so that it triggers only once at beginning of upkeep, instead of
//   being an activated ability usable any time during your upkeep.

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may pay {1}. If you do, untap this creature.";

export default defineCard({
  name: "Brass Man",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 3,
  text: `${UNTAP_STEP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to untap Brass Man?",
        cost: "{1}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
