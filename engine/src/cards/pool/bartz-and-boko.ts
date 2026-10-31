import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Final Fantasy (FIN). EDHREC rank 7158. Each other Bird is a source of its
// own, all dealing their damage at once.

const ENTER_TEXT =
  "When Bartz and Boko enters, each other Bird you control deals damage equal to its power to target creature an opponent controls.";

export default defineCard({
  name: "Bartz and Boko",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Bird"],
  power: 4,
  toughness: 3,
  selfCostReduction: affinity({ subtype: "Bird" }),
  text: `Affinity for Birds (This spell costs {1} less to cast for each Bird you control.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "each-deals-damage",
        filter: { type: "creature", controlledBy: "you", subtype: "Bird" },
        amount: "its-power",
        to: 0,
        exceptSource: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
