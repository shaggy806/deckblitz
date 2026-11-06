import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 31283.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control.";

export default defineCard({
  name: "Amanda Grayson, Logic's Link",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  selfCostReduction: affinity({ subtype: "Vulcan" }),
  text: `Affinity for Vulcans (This spell costs {1} less to cast for each Vulcan you control.)\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
