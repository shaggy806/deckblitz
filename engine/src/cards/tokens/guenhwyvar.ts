import { defineCard } from "../define.js";

/**
 * Drizzt Do'Urden's token — "create Guenhwyvar, a legendary 4/1 green Cat
 * creature token with trample." A named token whose name collides with no
 * card, so it's keyed by that name and the legend rule reads "Guenhwyvar".
 */
export default defineCard({
  name: "Guenhwyvar",
  art: "6b2c8f52-1580-42d5-8434-c4c70e31e31b",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample",
});
