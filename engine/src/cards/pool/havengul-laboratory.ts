import { defineCard } from "../define.js";

// EDHREC rank 9262.

export default defineCard({
  name: "Havengul Laboratory",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {C}.\n{4}, {T}: Investigate. (Create a colorless Clue artifact token with \"{2}, Sacrifice this artifact: Draw a card.\")\nAt the beginning of your end step, if you sacrificed three or more Clues this turn, transform Havengul Laboratory.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
      resolve: null,
      text: "{4}, {T}: Investigate.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you", filter: { subtype: "Clue" }, atLeast: 3 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of your end step, if you sacrificed three or more Clues this turn, transform Havengul Laboratory.",
    },
  ],
  faces: ["Havengul Laboratory", "Havengul Mystery"],
  transform: true,
});
