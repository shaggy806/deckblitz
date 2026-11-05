import { defineCard } from "../define.js";

const TEXT = "Whenever Aang and La attack, put a +1/+1 counter on each tapped creature you control.";

export default defineCard({
  name: "Aang and La, Ocean's Fury",
  art: "https://cards.scryfall.io/art_crop/back/8/2/82866a0e-485a-4f7e-8c49-f7d9ff3f4ad4.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Spirit", "Ally"],
  power: 5,
  toughness: 5,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", tapped: true },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Aang, Swift Savior", "Aang and La, Ocean's Fury"],
  transform: true,
});
