import { defineCard } from "../define.js";

// The back face of Smoldering Egg.

export default defineCard({
  name: "Ashmouth Dragon",
  art: "https://cards.scryfall.io/art_crop/back/4/1/41b6381f-4ff8-49e9-bf00-cfe32851318b.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast an instant or sorcery spell, this creature deals 2 damage to any target.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, this creature deals 2 damage to any target.",
    },
  ],
  faces: ["Smoldering Egg", "Ashmouth Dragon"],
  transform: true,
});
