import { defineCard } from "../define.js";

// The planeswalker back face of Liliana, Heretical Healer.

const EMBLEM = "Whenever a creature dies, return it to the battlefield under your control at the beginning of the next end step.";

export default defineCard({
  name: "Liliana, Defiant Necromancer",
  art: "https://cards.scryfall.io/art_crop/back/d/8/d8b718d8-fca3-4b3e-9448-6067c8656a9a.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 3,
  text: `+2: Each player discards a card.\n−X: Return target nonlegendary creature card with mana value X from your graveyard to the battlefield.\n−8: You get an emblem with "${EMBLEM}"`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: "+2: Each player discards a card.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", notSupertype: "legendary", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "−X: Return target nonlegendary creature card with mana value X from your graveyard to the battlefield.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "dies", who: "any", filter: { type: "creature" } },
            targets: [],
            effect: {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
              text: "Return that card to the battlefield under your control.",
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: `−8: You get an emblem with "${EMBLEM}"`,
    },
  ],
  faces: ["Liliana, Heretical Healer", "Liliana, Defiant Necromancer"],
  transform: true,
});
