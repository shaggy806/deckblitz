import { defineCard } from "../define.js";

// Each opponent's own first spell, once for each opponent (the rulings); a
// first spell already on the stack as Erayo flips was cast before, so it
// isn't countered.

const TEXT = "Whenever an opponent casts their first spell each turn, counter that spell.";

export default defineCard({
  name: "Erayo's Essence",
  art: "https://cards.scryfall.io/art_crop/front/0/b/0b61d772-2d8b-4acf-9dd2-b2e8b03538c8.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Erayo, Soratami Ascendant", "Erayo's Essence"],
  flip: true,
});
