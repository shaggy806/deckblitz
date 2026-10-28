import { defineCard } from "../define.js";

// Azusa's Many Journeys' back face.

const TEXT = "Whenever this creature becomes blocked, untap up to three lands you control.";

export default defineCard({
  name: "Likeness of the Seeker",
  art: "https://cards.scryfall.io/art_crop/back/e/8/e8a51d2a-1582-4bad-995c-e7fe9f810149.jpg",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: 3,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to three lands you control",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Azusa's Many Journeys", "Likeness of the Seeker"],
  transform: true,
});
