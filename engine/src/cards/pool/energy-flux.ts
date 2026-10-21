import { defineCard } from "../define.js";

// EDHREC rank 15069.
//
// A granted triggered ability on every artifact (Elder Owyn Lyons's
// `grantsTriggered` shape, over all artifacts): "your upkeep" and "you pay"
// are the artifact's controller's, since the ability is the artifact's own.

const GRANTED_TEXT = "At the beginning of your upkeep, sacrifice this artifact unless you pay {2}.";
const TEXT = `All artifacts have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Energy Flux",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact" } },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ pay: "{2}", text: "Pay {2}" }],
            otherwise: { kind: "sacrifice-source" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
