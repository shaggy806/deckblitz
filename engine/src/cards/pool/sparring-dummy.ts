import { defineCard } from "../define.js";

// EDHREC rank 17096.
//
// One card milled: the land half is Rapid Rescue's optional pick among the
// milled cards, and the life Liliana, Untouched by Death's "if a [card] is
// milled this way" — it reads what was milled, wherever the card is now.

const TAP_TEXT =
  "{T}: Mill a card. You may put a land card milled this way into your hand. You gain 2 life if a Lesson card is milled this way.";

export default defineCard({
  name: "Sparring Dummy",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TAP_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "land" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { subtype: "Lesson" } },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
