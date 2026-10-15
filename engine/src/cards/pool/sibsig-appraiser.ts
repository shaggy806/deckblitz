import { defineCard } from "../define.js";

// EDHREC rank 18742.
const TEXT =
  "When this creature enters, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";

export default defineCard({
  name: "Sibsig Appraiser",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Advisor"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
