import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT = "Whenever this creature or another creature you control dies, target opponent loses 1 life and you gain 1 life.";

// Vengeful Bloodwitch's two triggers (the ruling: dying beside another
// creature triggers once for each).
export default defineCard({
  name: "Wayward Disciple",
  art: "https://cards.scryfall.io/art_crop/back/7/a/7ac2a5aa-71c3-482b-9431-5f0b228cf64d.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    }),
  ],
  faces: ["Pious Evangel", "Wayward Disciple"],
  transform: true,
});
