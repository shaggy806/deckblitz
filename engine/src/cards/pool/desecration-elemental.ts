import { defineCard } from "../define.js";

// EDHREC rank 11813. Fifth Dawn.
//
// Any player's spell triggers it, its controller's included, and it may have
// to sacrifice itself (the rulings).

export default defineCard({
  name: "Desecration Elemental",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 8,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nWhenever a player casts a spell, sacrifice a creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "Whenever a player casts a spell, sacrifice a creature.",
    },
  ],
});
