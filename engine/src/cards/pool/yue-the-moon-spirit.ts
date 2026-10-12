import { defineCard } from "../define.js";

// EDHREC rank 6581.
//
// Rulings:
//   [2025-10-02] If a card has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2025-10-02] If you cast a card "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs. If the card has any
//     mandatory additional costs, such as that of Cathartic Reunion, you must pay those to cast
//     the card.
//
// Baral's Expertise's free cast from the hand, as the ability resolves (rule
// 608.2g), of a noncreature spell. The {T} taps Yue, so she can't also tap to
// help pay the waterbend part.

const BEND_TEXT = "Waterbend {5}, {T}: You may cast a noncreature spell from your hand without paying its mana cost.";

export default defineCard({
  name: "Yue, the Moon Spirit",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Ally"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  activated: [
    {
      cost: { mana: "{5}", tap: true, waterbend: true },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { notTypes: ["creature"] } },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
