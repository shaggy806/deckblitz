import { defineCard } from "../define.js";

export default defineCard({
  name: "Ainok Guide",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Scout"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Search your library for a basic land card, reveal it, then shuffle and put that card on top.",
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
            text: "Put a +1/+1 counter on this creature.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          {
            text: "Search your library for a basic land card, reveal it, then shuffle and put that card on top.",
            effect: {
              kind: "search-library",
              filter: { supertype: "basic", type: "land" },
              destination: "library-top",
              reveal: true,
              min: 0,
              max: 1,
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
