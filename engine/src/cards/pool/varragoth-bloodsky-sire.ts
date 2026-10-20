import { defineCard } from "../define.js";

// The target player searches (`search-library`'s `who`), shuffles, and puts
// the card they found on top (`destination: "library-top"`).
const BOAST_TEXT =
  "Boast — {1}{B}: Target player searches their library for a card, then shuffles and puts that card on top.";

export default defineCard({
  name: "Varragoth, Bloodsky Sire",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${BOAST_TEXT} (Activate only if this creature attacked this turn and only once each turn.)`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["player"],
      effect: {
        kind: "search-library",
        filter: {},
        destination: "library-top",
        min: 1,
        max: 1,
        who: { controllerOfTarget: 0 },
      },
      resolve: null,
      text: BOAST_TEXT,
      boast: true,
    },
  ],
});
