import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31042.
//
// Rulings:
//   [2004-10-04] The ability to untap a creature can be used even if the Golem is already
//     untapped.

const UNTAP_TEXT = "This creature doesn't untap during your untap step.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may untap target tapped creature an opponent controls. If you do, untap this creature.";

export default defineCard({
  name: "Soldevi Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { tapped: true, type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Untap the targeted creature? If you do, Soldevi Golem untaps too.",
        effect: { kind: "untap", target: 0 },
        then: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
