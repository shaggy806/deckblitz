import { defineCard } from "../define.js";

// EDHREC rank 17239.
//
// "A Kithkin, Forest, or Plains card" is one card with any of those subtypes
// (a changeling card is a Kithkin card).
const TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a Kithkin, Forest, or Plains card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Eclipsed Kithkin",
  manaCost: "{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Scout"],
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
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtypes: ["Kithkin", "Forest", "Plains"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
