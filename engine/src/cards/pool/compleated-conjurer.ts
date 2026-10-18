import { defineCard } from "../define.js";

// Captive Weird's back face.
//
// Rulings:
//   [2023-04-14] If you don't play the card, it will remain exiled.
//   [2023-04-14] You may play the card exiled with Compleated Conjurer even if Compleated Conjurer
//     leaves the battlefield or you lose control of it.
//
// Alania's Pathmaker's impulse draw, on the transform trigger.

const TEXT =
  "When this creature transforms into Compleated Conjurer, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Compleated Conjurer",
  art: "https://cards.scryfall.io/art_crop/back/7/0/70668650-0fb1-4486-a4e6-ab9a12be5626.jpg",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Weird"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Captive Weird", "Compleated Conjurer"],
  transform: true,
});
