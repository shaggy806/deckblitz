import { defineCard } from "../define.js";

// "Any number" is up to the whole library; the finds go on top after the
// search's shuffle, in the order picked (Congregation at Dawn's shape).
const TEXT =
  "When this creature enters, search your library for any number of Dwarf cards, reveal them, then shuffle and put those cards on top in any order.";

export default defineCard({
  name: "Dwarven Recruiter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Dwarf" },
        destination: "library-top",
        reveal: true,
        min: 0,
        max: { librarySize: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
