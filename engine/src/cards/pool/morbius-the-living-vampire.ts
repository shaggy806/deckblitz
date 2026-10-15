import { defineCard } from "../define.js";

const GRAVE_TEXT =
  "{U}{B}, Exile this card from your graveyard: Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Morbius the Living Vampire",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Scientist", "Villain"],
  power: 3,
  toughness: 1,
  keywords: ["flying", "vigilance", "lifelink"],
  text: `Flying, vigilance, lifelink\n${GRAVE_TEXT}`,
  activated: [
    {
      // `zone: "graveyard"` makes exiling this card the implicit cost
      // (Faerie Dreamthief); Anticipate's look-three.
      cost: { mana: "{U}{B}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: GRAVE_TEXT,
    },
  ],
});
