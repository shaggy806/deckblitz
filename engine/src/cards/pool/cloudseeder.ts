import { defineCard } from "../define.js";

// EDHREC rank 20457.
//
// Rulings:
//   [2021-03-19] Unlike the card Cloud Sprite, the token has no mana cost. Its mana value is 0.

const MAKE_TEXT =
  '{U}, {T}, Discard a card: Create a 1/1 blue Faerie creature token named Cloud Sprite. It has flying and "This token can block only creatures with flying."';

export default defineCard({
  name: "Cloudseeder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Spellshaper"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${MAKE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Cloud Sprite Token", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
