import { defineCard } from "../define.js";

// The combined back face of Bruna, the Fading Light and Gisela, the Broken Blade
// (rule 712.5a): never a card of its own, only the face of the permanent they
// meld into (`meldOf`). Its mana value there is theirs summed, 11 (rule 712.8g),
// and its own prohibition reads each spell's mana value as it's cast.
const CAST_TEXT = "Your opponents can't cast spells with mana value 3 or less.";

export default defineCard({
  name: "Brisela, Voice of Nightmares",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Angel"],
  power: 9,
  toughness: 10,
  keywords: ["flying", "first-strike", "vigilance", "lifelink"],
  meldOf: ["Bruna, the Fading Light", "Gisela, the Broken Blade"],
  text: `Flying, first strike, vigilance, lifelink\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "opponents", filter: { manaValue: { op: "lte", n: 3 } } }],
      text: CAST_TEXT,
    },
  ],
});
