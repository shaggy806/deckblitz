import { defineCard } from "../define.js";

// EDHREC rank 25079. Snow landwalk: landwalk whose land is any snow land
// (rule 702.14c).
//
// Rulings:
//   Zombie Musher can't be blocked as long as defending player controls a snow land.

export default defineCard({
  name: "Zombie Musher",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: "Snow landwalk (This creature can't be blocked as long as defending player controls a snow land.)\n{S}: Regenerate this creature. ({S} can be paid with one mana from a snow source.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", supertype: "snow" },
      text: "Snow landwalk",
    },
  ],
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{S}: Regenerate this creature.",
    },
  ],
});
