import { defineCard } from "../define.js";

export default defineCard({
  name: "Rootless Yew",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 5,
  toughness: 4,
  text: "When this creature dies, search your library for a creature card with power or toughness 6 or greater, reveal it, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          anyOf: [{ power: { op: "gte", n: 6 } }, { toughness: { op: "gte", n: 6 } }],
        },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: "When this creature dies, search your library for a creature card with power or toughness 6 or greater, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
