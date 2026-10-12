import { defineCard } from "../define.js";

export default defineCard({
  name: "Ulvenwald Abomination",
  art: "https://cards.scryfall.io/art_crop/back/0/d/0dbaef61-fa39-4ea7-bc21-445401c373e7.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 4,
  toughness: 6,
  text: "{T}: Add {C}{C}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      text: "{T}: Add {C}{C}.",
    },
  ],
  faces: ["Ulvenwald Captive", "Ulvenwald Abomination"],
  transform: true,
});
