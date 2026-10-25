import { defineCard } from "../define.js";

// EDHREC rank 11113. Jurassic World Collection.

export default defineCard({
  name: "Cresting Mosasaurus",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 8,
  alternativeCost: { mana: "{6}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {6}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen this creature enters, if you cast it, return each non-Dinosaur creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: { kind: "return-to-hand-all", filter: { type: "creature", notSubtypes: ["Dinosaur"] } },
      resolve: null,
      text: "When this creature enters, if you cast it, return each non-Dinosaur creature to its owner's hand.",
    },
  ],
});
