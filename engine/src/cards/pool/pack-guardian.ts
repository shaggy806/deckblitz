import { defineCard } from "../define.js";

// EDHREC rank 20262.

const TEXT = "When this creature enters, you may discard a land card. If you do, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Pack Guardian",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Spirit"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a land card to create a 2/2 Wolf?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, filter: { type: "land" } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "create-token", token: "Wolf Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
