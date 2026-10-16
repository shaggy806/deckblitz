import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Gurmag Nightwatch's enters trigger.

const TEXT =
  "When this creature enters, look at the top three cards of your library. You may put one of those cards back on top of your library. Put the rest into your graveyard.";

export default defineCard({
  name: "Sage of Days",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 0,
        max: 1,
        destination: "library-top",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
