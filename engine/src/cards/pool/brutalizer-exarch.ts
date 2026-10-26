import { defineCard } from "../define.js";

// EDHREC rank 14665.
export default defineCard({
  name: "Brutalizer Exarch",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, choose one —\n• Search your library for a creature card, reveal it, then shuffle and put that card on top.\n• Put target noncreature permanent on the bottom of its owner's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Search your library for a creature card, reveal it, then shuffle and put that card on top.",
            effect: {
              kind: "search-library",
              filter: { type: "creature" },
              destination: "library-top",
              min: 0,
              max: 1,
              reveal: true,
            },
          },
          {
            text: "Put target noncreature permanent on the bottom of its owner's library.",
            targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
            effect: { kind: "put-on-bottom-of-library", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
