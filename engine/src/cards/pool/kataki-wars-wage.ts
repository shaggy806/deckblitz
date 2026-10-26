import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 9779. Energy Flux's grant, at {1}.

const TEXT = 'All artifacts have "At the beginning of your upkeep, sacrifice this artifact unless you pay {1}."';
const GRANTED_TEXT = "At the beginning of your upkeep, sacrifice this artifact unless you pay {1}.";

export default defineCard({
  name: "Kataki, War's Wage",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
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
            options: [{ pay: "{1}", text: "Pay {1}" }],
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
