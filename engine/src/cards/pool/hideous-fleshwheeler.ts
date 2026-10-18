import { defineCard } from "../define.js";

// Nezumi Freewheeler's back face. "Permanent card" is a card with a
// permanent type (rule 110.4b); any graveyard, Vat Emergence's shape.

const TRANSFORM_TEXT =
  "When this creature transforms into Hideous Fleshwheeler, put target permanent card with mana value 2 or less from a graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Hideous Fleshwheeler",
  art: "https://cards.scryfall.io/art_crop/back/7/6/76b5e289-6bc4-48ee-8d5b-6989bab9f901.jpg",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Rat"],
  power: 4,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [
        {
          kind: "card-in-graveyard",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            manaValue: { op: "lte", n: 2 },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Nezumi Freewheeler", "Hideous Fleshwheeler"],
  transform: true,
});
