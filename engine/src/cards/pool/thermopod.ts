import { defineCard } from "../define.js";

// EDHREC rank 10243. Coldsnap.

export default defineCard({
  name: "Thermopod",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Slug"],
  power: 4,
  toughness: 3,
  text: "{S}: This creature gains haste until end of turn. ({S} can be paid with one mana from a snow source.)\nSacrifice a creature: Add {R}.",
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{S}: This creature gains haste until end of turn.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "Sacrifice a creature: Add {R}.",
    },
  ],
});
