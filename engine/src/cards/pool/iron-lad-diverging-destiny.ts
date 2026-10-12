import { defineCard } from "../define.js";

// EDHREC rank 11358. Marvel Super Heroes.
//
// Thrasios's shape: the revealed card is target 0 of `reveal-top`'s `then`;
// with an empty library nothing is revealed and nothing is drawn.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const TAP_TEXT = "{T}: Reveal the top card of your library. If it's an artifact card, draw a card.";

export default defineCard({
  name: "Iron Lad, Diverging Destiny",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${LOOK_TEXT}\n${TAP_TEXT}`,
  looksAtOwnLibraryTop: true,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "artifact" } },
          then: { kind: "draw", amount: 1 },
        },
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
