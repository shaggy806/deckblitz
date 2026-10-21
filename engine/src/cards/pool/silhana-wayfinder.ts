import { defineCard } from "../define.js";

// EDHREC rank 21853.

const TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a creature or land card from among them and put it on top of your library. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Silhana Wayfinder",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
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
        filter: { typesAnyOf: ["creature", "land"] },
        destination: "library-top",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
