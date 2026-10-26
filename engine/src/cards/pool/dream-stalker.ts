import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 13889.
//
// Kor Skyfisher's trigger: chosen on resolution, untargeted, Dream Stalker
// itself allowed (the rulings).
export default defineCard({
  name: "Dream Stalker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 5,
  text: "When this creature enters, return a permanent you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a permanent you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a permanent you control to its owner's hand.",
    },
  ],
});
