import { defineCard } from "../define.js";

// EDHREC rank 27409.
//
// "You may put one of those cards on top" is `min: 0` back on top; the rest
// go to the bottom in a random order.

const ETB_TEXT =
  "Domain — When this creature enters, look at the top X cards of your library, where X is the number of basic land types among lands you control. You may put one of those cards on top of your library. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Voda Sea Scavenger",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { basicLandTypes: "you" },
        min: 0,
        max: 1,
        destination: "library-top",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
