import { defineCard } from "../define.js";

// EDHREC rank 17390. Rook Turret's loot, without its "another": an artifact
// entering includes this creature only if it's an artifact, which it isn't.
const ENTER_TEXT = "Whenever an artifact you control enters, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Skyswimmer Koi",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
