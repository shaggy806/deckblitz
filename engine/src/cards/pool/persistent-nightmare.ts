import { defineCard } from "../define.js";


export default defineCard({
  name: "Persistent Nightmare",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e630fc56-a96f-4abf-be8d-f0f40d5a9edf.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 1,
  toughness: 1,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nWhen this creature deals combat damage to a player, return it to its owner's hand.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "When this creature deals combat damage to a player, return it to its owner's hand.",
    },
  ],
  faces: ["Startled Awake", "Persistent Nightmare"],
  transform: true,
});
