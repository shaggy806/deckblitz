import { defineCard } from "../define.js";

export default defineCard({
  name: "Kuon's Essence",
  art: "https://cards.scryfall.io/art_crop/front/4/1/41004bdf-8e09-4b2c-9e9c-26c25eac9854.jpg",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "At the beginning of each player's upkeep, that player sacrifices a creature of their choice.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player sacrifices a creature of their choice.",
    },
  ],
  faces: ["Kuon, Ogre Ascendant", "Kuon's Essence"],
  flip: true,
});
