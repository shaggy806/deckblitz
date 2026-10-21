import { defineCard } from "../define.js";

// EDHREC rank 18807.
//
// Rulings:
//   [2019-06-14] If Alpine Guide can't attack for any reason (such as being tapped or having come
//     under a player's control that turn), then it doesn't attack.

export default defineCard({
  name: "Alpine Guide",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you may search your library for a Mountain card, put that card onto the battlefield tapped, then shuffle.\nThis creature attacks each combat if able.\nWhen this creature leaves the battlefield, sacrifice a Mountain.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Mountain card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Mountain" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a Mountain card, put that card onto the battlefield tapped, then shuffle.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { subtype: "Mountain" }, count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, sacrifice a Mountain.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
