import { defineCard } from "../define.js";

// EDHREC rank 2212. Rashmi's shape: the top card is offered free only if it's a
// creature sharing a creature type with a creature you control; declined, or
// not such a creature, it goes on the bottom of your library (the ruling).

const TEXT =
  "At the beginning of your upkeep, reveal the top card of your library. If it's a creature card that shares a creature type with a creature you control, you may cast it without paying its mana cost. If you don't cast it, put it on the bottom of your library.";

export default defineCard({
  name: "Descendants' Path",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { libraryTop: 1, reveal: true },
        free: true,
        spell: { type: "creature", sharesCreatureTypeWith: { controlled: { type: "creature" } } },
        else: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          min: 1,
          max: 1,
          destination: "library-bottom",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
