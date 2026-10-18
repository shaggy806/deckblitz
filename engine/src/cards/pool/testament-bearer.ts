import { defineCard } from "../define.js";

// EDHREC rank 22163.

const TEXT =
  "When this creature dies, look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Testament Bearer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 4,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
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
      resolve: null,
      text: TEXT,
    },
  ],
});
