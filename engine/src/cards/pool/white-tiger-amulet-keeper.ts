import { defineCard } from "../define.js";

// EDHREC rank 30416.
//
// A graveyard ability whose cost exiles the card (`zone: "graveyard"`), then
// Growth Spiral's draw-and-land.

const GRAVE_TEXT =
  "{3}{G}, Exile this card from your graveyard: Draw a card. You may put a land card from your hand onto the battlefield.";

export default defineCard({
  name: "White Tiger, Amulet Keeper",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 1,
  text: GRAVE_TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: GRAVE_TEXT,
      zone: "graveyard",
    },
  ],
});
