import { defineCard } from "../define.js";

// Nylea, Keen-Eyed's reveal: the card to hand if it qualifies, otherwise your
// choice of the graveyard or leaving it on top (the ruling).
const TEXT =
  "Whenever Kellan attacks, reveal the top card of your library. If it's a creature card with mana value 3 or less, put it into your hand. Otherwise, you may put it into your graveyard.";

export default defineCard({
  name: "Kellan, Daring Traveler",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Faerie", "Scout"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "graveyard" },
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Kellan, Daring Traveler", "Journey On"],
  adventure: true,
});
