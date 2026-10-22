import { defineCard } from "../define.js";

// Arabian Nights (ARN). EDHREC rank 28269.
//
// Rulings:
//   The sacrifice of the land is done during the resolution of the triggered ability. You also
//     choose the land at that time.
//
// "When you control no lands" is a state trigger (rule 603.8).

const UPKEEP =
  "At the beginning of your upkeep, sacrifice a land. If you sacrifice an Island this way, this creature deals 3 damage to you.";
const NO_LANDS = "When you control no lands, sacrifice this creature.";

export default defineCard({
  name: "Serendib Djinn",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP}\n${NO_LANDS}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", filter: { subtype: "Island" } },
            then: { kind: "damage", amount: 3, who: "you" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "state", state: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 1 } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: NO_LANDS,
    },
  ],
});
