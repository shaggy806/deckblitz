import { defineCard } from "../define.js";

// EDHREC rank 8674.
//
// Thundertrap Trainer's look: an "Elemental, Island, or Mountain card" is any
// one of the three subtypes (`subtypes` is an OR, read through `hasSubtype`,
// so a changeling card is an Elemental card too).
const LOOK_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal an Elemental, Island, or Mountain card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Eclipsed Flamekin",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Scout"],
  power: 1,
  toughness: 4,
  text: LOOK_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtypes: ["Elemental", "Island", "Mountain"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
