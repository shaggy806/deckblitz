import { defineCard } from "../define.js";

// EDHREC rank 18659.
//
// Casey Jones, Jury-Rig Justiciar's look at four, here for "a Merfolk,
// Plains, or Island card" — `subtypes` is an OR, and a changeling card is a
// Merfolk card in the library too (rule 702.73a).

const ENTER_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a Merfolk, Plains, or Island card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Eclipsed Merrow",
  manaCost: "{W/U}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 3,
  text: ENTER_TEXT,
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
        filter: { subtypes: ["Merfolk", "Plains", "Island"] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
