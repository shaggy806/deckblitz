import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 20610.

const ETB_TEXT = "When this creature enters, choose one —";
const DESTROY_MODE = "• Destroy target noncreature, nonland permanent.";
const LIFE_MODE = "• You gain 4 life.";

export default defineCard({
  name: "Archive Arbiter",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${DESTROY_MODE}\n${LIFE_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DESTROY_MODE,
            targets: [{ kind: "permanent", filter: { notTypes: ["creature", "land"] } }],
            effect: { kind: "destroy", target: 0 },
          },
          { text: LIFE_MODE, effect: { kind: "gain-life", amount: 4 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${DESTROY_MODE} ${LIFE_MODE}`,
    },
  ],
});
