import { defineCard } from "../define.js";

/**
 * There and Back Again's token: "Smaug, a legendary 6/6 red Dragon creature
 * token with flying, haste, and 'When Smaug dies, create fourteen Treasure
 * tokens.'" A named legendary token (Angelo's shape), so the legend rule
 * (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Smaug",
  art: "bb4ac08f-f6a5-49d6-91e9-38c4f217932b",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nWhen this creature dies, create fourteen Treasure tokens.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 14 },
      resolve: null,
      text: "When this creature dies, create fourteen Treasure tokens.",
    },
  ],
});
