import { defineCard } from "../define.js";

// EDHREC rank 26033.
// Makes Wall → "Wall Token (The Fantastic Four)".

const ETB_TEXT = "When Doctor Spectrum enters, choose one —";
const WALL_MODE = "• Create a 0/4 colorless Wall creature token with defender.";
const HERO_MODE = "• Put a +1/+1 counter on each other Hero you control.";
const DESTROY_MODE = "• Destroy target enchantment.";

export default defineCard({
  name: "Doctor Spectrum",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${WALL_MODE}\n${HERO_MODE}\n${DESTROY_MODE}`,
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
          { text: WALL_MODE, effect: { kind: "create-token", token: "Wall Token (The Fantastic Four)", count: 1 } },
          {
            text: HERO_MODE,
            effect: {
              kind: "add-counter-all",
              filter: { subtype: "Hero", controlledBy: "you" },
              counter: "+1/+1",
              amount: 1,
              exceptSource: true,
            },
          },
          { text: DESTROY_MODE, targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${WALL_MODE} ${HERO_MODE} ${DESTROY_MODE}`,
    },
  ],
});
