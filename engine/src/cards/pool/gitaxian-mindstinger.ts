import { defineCard } from "../define.js";

// The back face of Aetherblade Agent. March of the Machine.

export default defineCard({
  name: "Gitaxian Mindstinger",
  art: "https://cards.scryfall.io/art_crop/back/d/a/dad34ae5-56b4-4394-be02-e043dc1cc23d.jpg",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhenever this creature deals combat damage to a player or battle, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player or battle, draw a card.",
    },
  ],
  faces: ["Aetherblade Agent", "Gitaxian Mindstinger"],
  transform: true,
});
