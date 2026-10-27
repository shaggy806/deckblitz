import { defineCard } from "../define.js";

// EDHREC rank 3360. Dwarven Recruiter's shape: "any number" is up to the whole
// library; the finds go on top after the search's shuffle, in the order picked.
// "Goblin cards" is the creature type, kindred cards included (the ruling).
const TEXT =
  "When this creature enters, search your library for any number of Goblin cards, reveal them, then shuffle and put those cards on top in any order.";

export default defineCard({
  name: "Goblin Recruiter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Goblin" },
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
