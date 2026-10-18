import { defineCard } from "../define.js";

// "The exiled card used to craft it" (rule 702.167c) is the card exiled with
// the permanent it became; several add up, and an exiled token is no card
// and counts nothing (the rulings).

const ENTER_TEXT = "When this creature enters, you gain life equal to the mana value of the exiled card used to craft it.";

export default defineCard({
  name: "Jadeheart Attendant",
  art: "https://cards.scryfall.io/art_crop/back/b/b/bb95ffc2-ef35-49bf-8211-c5354d176051.jpg",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 7,
  toughness: 7,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { exiledWithSourceManaValue: true } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Jade Seedstones", "Jadeheart Attendant"],
  transform: true,
});
