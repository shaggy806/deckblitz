import { defineCard } from "../define.js";

// EDHREC rank 7456.
//
// Rulings:
//   [2023-06-16] If the defending player controls two or more creatures tied for the least power
//     among creatures they control, that player chooses one of them to sacrifice.

export default defineCard({
  name: "Witch-king, Bringer of Ruin",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wraith", "Noble"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever Witch-king attacks, defending player sacrifices a creature with the least power among creatures they control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "trigger-player",
        count: 1,
        filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" }, least: true } },
      },
      resolve: null,
      text: "Whenever Witch-king attacks, defending player sacrifices a creature with the least power among creatures they control.",
    },
  ],
});
