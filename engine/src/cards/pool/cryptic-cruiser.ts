import { defineCard } from "../define.js";

// EDHREC rank 27406.

export default defineCard({
  name: "Cryptic Cruiser",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 3,
  toughness: 3,
  text: "Devoid (This card has no color.)\n{2}{U}, Put a card an opponent owns from exile into that player's graveyard: Tap target creature.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, putFromExile: 1 },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}{U}, Put a card an opponent owns from exile into that player's graveyard: Tap target creature.",
    },
  ],
});
