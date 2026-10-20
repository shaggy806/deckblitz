import { defineCard } from "../define.js";

// EDHREC rank 21995. Wail of the Forgotten's look-and-choose.

export default defineCard({
  name: "Organ Hoarder",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, look at the top three cards of your library, then put one of them into your hand and the rest into your graveyard.",
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      text: "When this creature enters, look at the top three cards of your library, then put one of them into your hand and the rest into your graveyard.",
    },
  ],
});
