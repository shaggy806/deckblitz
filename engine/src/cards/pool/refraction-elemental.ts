import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast a spell, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "Refraction Elemental",
  art: "https://cards.scryfall.io/art_crop/back/7/7/776b8951-cf15-47ff-b36f-f47706eddb6f.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `Ward—Pay 2 life.\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 2 } },
      resolve: null,
      text: "Ward—Pay 2 life.",
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Invasion of Karsus", "Refraction Elemental"],
  transform: true,
});
