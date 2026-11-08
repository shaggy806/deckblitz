import { defineCard } from "../define.js";

// Its tokens remember it (`linkedToSource`), so several Artisans each exile their
// own, and a token from an activation that resolved after it left goes too (the
// rulings). A copy of a token wasn't created with it, and stays (the ruling).

const MAKE =
  "{2}{U}, {T}: Target player draws a card, then exiles a card from their hand. If a creature card is exiled this way, that player creates a token that's a copy of that card.";
const LEAVES =
  "When this creature leaves the battlefield, exile all tokens created with it at the beginning of the next end step.";

export default defineCard({
  name: "Arcane Artisan",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 3,
  text: `${MAKE}\n${LEAVES}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, target: 0 },
          {
            kind: "for-each-player",
            who: { target: 0 },
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "hand",
              min: 1,
              max: 1,
              destination: "exile",
              unlinked: true,
              leftover: "stay",
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: {
              kind: "create-token-copy",
              of: { thisWay: "exiled" },
              count: 1,
              who: { target: 0 },
              linkedToSource: true,
            },
          },
        ],
      },
      resolve: null,
      text: MAKE,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "exile-all", filter: { token: true, createdWithSource: true } },
        text: "Exile all tokens created with it.",
      },
      resolve: null,
      text: LEAVES,
    },
  ],
});
