import { defineCard } from "../define.js";

// Concealing Curtains' back face.
//
// Reckoner Shakedown's optional `discard-chosen` and `this-way` check: the
// draw happens only if a card was discarded ("if you do … then draws").

const TRANSFORM_TEXT =
  "When this creature transforms into Revealing Eye, target opponent reveals their hand. You may choose a nonland card from it. If you do, that player discards that card, then draws a card.";

export default defineCard({
  name: "Revealing Eye",
  art: "https://cards.scryfall.io/art_crop/back/6/1/612b2e6e-fe8d-49ad-b845-6fa7fa59ffd1.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye", "Horror"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, optional: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", atLeast: 1 },
            then: { kind: "draw", amount: 1, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Concealing Curtains", "Revealing Eye"],
  transform: true,
});
