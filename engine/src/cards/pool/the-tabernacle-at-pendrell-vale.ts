import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 8860.
//
// A granted triggered ability on every creature (Energy Flux's
// `grantsTriggered` shape): "your upkeep" and "you pay" are the creature's
// controller's, since the ability is the creature's own, and "this creature"
// is the creature it's on.

const GRANTED_TEXT = "At the beginning of your upkeep, destroy this creature unless you pay {1}.";
const TEXT = `All creatures have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "The Tabernacle at Pendrell Vale",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ pay: "{1}", text: "Pay {1}" }],
            otherwise: { kind: "destroy", target: "source" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
