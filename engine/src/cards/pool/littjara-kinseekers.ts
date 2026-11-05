import { defineCard } from "../define.js";

// An intervening if (rule 603.4): checked as it triggers and again as it
// resolves, the three needn't be the same three (the ruling).

const ETB_TEXT =
  "When this creature enters, if you control three or more creatures that share a creature type, put a +1/+1 counter on this creature, then scry 1.";

export default defineCard({
  name: "Littjara Kinseekers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 4,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 3, sharingACreatureType: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
