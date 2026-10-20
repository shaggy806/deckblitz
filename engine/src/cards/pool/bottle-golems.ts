import { defineCard } from "../define.js";

// Its power as it last existed on the battlefield (its ruling).
const DIES_TEXT = "When this creature dies, you gain life equal to its power.";

export default defineCard({
  name: "Bottle Golems",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
