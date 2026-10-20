import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const DIES_TEXT = "Whenever this creature or another Wolf or Werewolf you control dies, draw a card.";

export default defineCard({
  name: "Wedding Crasher",
  art: "https://cards.scryfall.io/art_crop/back/7/a/7a743426-6333-4ca6-9207-163b325ba435.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 5,
  keywords: ["nightbound"],
  text: `${DIES_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "you-control", filter: { subtypes: ["Wolf", "Werewolf"] } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    }),
  ],
  faces: ["Wolfkin Outcast", "Wedding Crasher"],
  transform: true,
});
