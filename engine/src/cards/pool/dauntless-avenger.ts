import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, return target creature card with mana value 2 or less from your graveyard to the battlefield tapped and attacking.";

export default defineCard({
  name: "Dauntless Avenger",
  art: "https://cards.scryfall.io/art_crop/back/4/a/4adee830-62fd-4ab4-b1c6-a8bbe15331d1.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Bereaved Survivor", "Dauntless Avenger"],
  transform: true,
});
