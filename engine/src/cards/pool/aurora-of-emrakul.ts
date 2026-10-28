import { defineCard } from "../define.js";

// The back face of Cryptolith Fragment (cryptolith-fragment.ts).

export default defineCard({
  name: "Aurora of Emrakul",
  art: "https://cards.scryfall.io/art_crop/back/2/6/262b7b55-0b32-4c4f-a2ca-02f0b83fa7a2.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Reflection"],
  power: 1,
  toughness: 4,
  keywords: ["flying", "deathtouch"],
  text: "Flying, deathtouch\nWhenever this creature attacks, each opponent loses 3 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-opponent" },
      resolve: null,
      text: "Whenever this creature attacks, each opponent loses 3 life.",
    },
  ],
  faces: ["Cryptolith Fragment", "Aurora of Emrakul"],
  transform: true,
});
