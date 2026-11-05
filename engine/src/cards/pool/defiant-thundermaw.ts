import { defineCard } from "../define.js";


export default defineCard({
  name: "Defiant Thundermaw",
  art: "https://cards.scryfall.io/art_crop/back/a/9/a98f71a0-7c99-4cee-8f70-877e698cca84.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhenever a Dragon you control attacks, it deals 2 damage to any target.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Dragon" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0, from: "trigger-object" },
      resolve: null,
      text: "Whenever a Dragon you control attacks, it deals 2 damage to any target.",
    },
  ],
  faces: ["Invasion of Tarkir", "Defiant Thundermaw"],
  transform: true,
});
