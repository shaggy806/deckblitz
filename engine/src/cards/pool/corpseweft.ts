import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{1}{B}, Exile one or more creature cards from your graveyard: Create a tapped X/X black Zombie Horror creature token, where X is twice the number of cards exiled this way.";

// "One or more" is an X announced with the activation (at least 1) and paid
// in exiled creature cards; "exiled this way" is that activation's X (its
// ruling), so the token's size is twice it.
export default defineCard({
  name: "Corpseweft",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, exileFromGraveyard: { count: "x", filter: { type: "creature" } } },
      minX: 1,
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Horror Token",
        count: 1,
        tapped: true,
        basePt: { power: { product: ["x", 2] }, toughness: { product: ["x", 2] } },
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
