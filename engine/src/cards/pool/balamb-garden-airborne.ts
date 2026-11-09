import { defineCard } from "../define.js";

export default defineCard({
  name: "Balamb Garden, Airborne",
  art: "https://cards.scryfall.io/art_crop/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever Balamb Garden attacks, draw a card.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever Balamb Garden attacks, draw a card.",
    },
  ],
  faces: ["Balamb Garden, SeeD Academy", "Balamb Garden, Airborne"],
  transform: true,
});
