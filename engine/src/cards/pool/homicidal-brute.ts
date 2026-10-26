import { defineCard } from "../define.js";

// Civilized Scholar's back face.
//
// Rulings:
//   [2011-09-22] You'll tap and transform Homicidal Brute even if it couldn't attack.
//   [2011-09-22] If Civilized Scholar attacks, and later in the turn (but before the beginning of
//     your end step), it transforms, Homicidal Brute's last ability won't trigger.
//
// `attackedThisTurn` is on the object, which transforming doesn't change, so
// an attack as the Scholar counts.

const TEXT =
  "At the beginning of your end step, if this creature didn't attack this turn, tap this creature, then transform it.";

export default defineCard({
  name: "Homicidal Brute",
  art: "https://cards.scryfall.io/art_crop/back/7/b/7bf864db-4754-433d-9d77-6695f78f6c09.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mutant"],
  power: 5,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { attackedThisTurn: false } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "source" },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Civilized Scholar", "Homicidal Brute"],
  transform: true,
});
