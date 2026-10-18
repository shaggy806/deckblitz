import { defineCard } from "../define.js";

// Ephara leaves itself out of the count: a static's `controls` condition never
// counts its own permanent ("three other enchantments").

const KEYWORD_TEXT = "Ephara has lifelink and indestructible as long as you control at least three other enchantments.";
const DRAW_TEXT = "Whenever another enchantment you control enters, draw a card.";

export default defineCard({
  name: "Ephara, Ever-Sheltering",
  art: "https://cards.scryfall.io/art_crop/back/4/3/433e9f1c-9d6c-4c7e-89d0-79595b4331f2.jpg",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 4,
  text: `${KEYWORD_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 3 },
      grantKeywords: ["lifelink", "indestructible"],
      text: KEYWORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "enchantment" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["Invasion of Theros", "Ephara, Ever-Sheltering"],
  transform: true,
});
