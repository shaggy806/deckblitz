import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 23054. The reveal is Borborygmos Enraged's shape: every
// artifact card among the three goes to hand, the rest to the graveyard.

const ETB_TEXT =
  "When this creature enters, reveal the top three cards of your library. Put all artifact cards revealed this way into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Chromescale Drake",
  manaCost: "{6}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: true,
        min: 3,
        max: 3,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
