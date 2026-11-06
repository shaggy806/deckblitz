import { defineCard } from "../define.js";

// EDHREC rank 28237.
// A Food card with no Food ability of its own: only Food tokens have one
// (rule 111.10b).

const ENTER_TEXT = "When this artifact enters, draw a card.";
const SAC_TEXT = "{2}, {T}, Sacrifice this artifact: Choose one —";

export default defineCard({
  name: "Tea, Earl Grey, Hot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}\n• This artifact deals 2 damage to target opponent.\n• You gain 3 life.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This artifact deals 2 damage to target opponent.",
            targets: ["opponent"],
            effect: { kind: "damage", amount: 2, target: 0 },
          },
          { text: "You gain 3 life.", effect: { kind: "gain-life", amount: 3 } },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
