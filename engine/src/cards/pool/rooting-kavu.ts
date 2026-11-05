import { defineCard } from "../define.js";

// EDHREC rank 27581.
//
// "You may exile it. If you do": the card it became, while it's still that
// card in the graveyard (Greenwarden of Murasa's shape); then only the
// creature cards of the graveyard are shuffled in (`filter` — Barishi).
const TEXT =
  "When this creature dies, you may exile it. If you do, shuffle all creature cards from your graveyard into your library.";

export default defineCard({
  name: "Rooting Kavu",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Rooting Kavu to shuffle all creature cards from your graveyard into your library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "shuffle-graveyard-into-library", target: "you", filter: { type: "creature" } },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
