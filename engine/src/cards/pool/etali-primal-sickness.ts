import { defineCard } from "../define.js";


export default defineCard({
  name: "Etali, Primal Sickness",
  art: "https://cards.scryfall.io/art_crop/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elder", "Dinosaur"],
  power: 11,
  toughness: 11,
  keywords: ["trample", "indestructible"],
  text: "Trample, indestructible\nWhenever Etali deals combat damage to a player, they get that many poison counters. (A player with ten or more poison counters loses the game.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: "Whenever Etali deals combat damage to a player, they get that many poison counters.",
    },
  ],
  faces: ["Etali, Primal Conqueror", "Etali, Primal Sickness"],
  transform: true,
});
