import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Weatherlight (WTH). EDHREC rank 18497.
//
// "Exile any number of them and put the rest back on top in any order" is
// two choices over the same ten cards: first the player orders all ten on
// top (Ponder's "put them back in any order"), then exiles any number of
// those ten, the rest staying in that order. Every outcome the card allows —
// any subset exiled, the rest in any order — is one of these, and the player
// sees all ten cards for both choices.

const ETB_TEXT =
  "When this enchantment enters, look at the top ten cards of your library, then exile any number of them and put the rest back on top of your library in any order.";
const LEAVES_TEXT = "When this enchantment leaves the battlefield, shuffle your library.";

const upkeep = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Ancestral Knowledge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${upkeep.text}\n${ETB_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 10,
            min: 10,
            max: 10,
            destination: "library-top",
            leftover: "stay",
          },
          {
            kind: "look-and-choose",
            zone: "library",
            count: 10,
            min: 0,
            max: 10,
            destination: "exile",
            unlinked: true,
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "shuffle-library" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
