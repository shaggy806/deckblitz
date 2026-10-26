import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] The creature card must have one of the listed abilities, not an ability that
//     grants one of the listed abilities to the creature. For example, you couldn't put Prized
//     Elephant, which has "{G}: Prized Elephant gains trample until end of turn," on top of your
//     library this way.
//
// A `keyword` filter on a library card reads its printed keywords.

const TEXT =
  "When this creature enters, search your library for a creature card with deathtouch, hexproof, reach, or trample and reveal it. Shuffle and put that card on top.";

export default defineCard({
  name: "Mwonvuli Beast Tracker",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          anyOf: [{ keyword: "deathtouch" }, { keyword: "hexproof" }, { keyword: "reach" }, { keyword: "trample" }],
        },
        destination: "library-top",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
