import { defineCard } from "../define.js";

// Every creature blocking it or blocked by it as the end of
// combat step begins — a band it blocked included (rule 702.22h).
const END_TEXT = "At end of combat, destroy all creatures blocking or blocked by this creature.";

export default defineCard({
  name: "Kjeldoran Frostbeast",
  manaCost: "{3}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 2,
  toughness: 4,
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", blockingRelation: { relation: "either" } },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
