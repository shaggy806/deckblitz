import { defineCard } from "../define.js";

// EDHREC rank 10114.
//
// Rulings:
//   [2020-06-23] If Leafkin Avenger leaves the battlefield while its last ability is on the stack,
//     use its power as it last existed on the battlefield to determine how much damage it deals.

export default defineCard({
  name: "Leafkin Avenger",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Druid"],
  power: 4,
  toughness: 3,
  text: "{T}: Add {G} for each creature with power 4 or greater you control.\n{7}{R}: This creature deals damage equal to its power to target player or planeswalker.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } },
      },
      resolve: null,
      text: "{T}: Add {G} for each creature with power 4 or greater you control.",
    },
    {
      cost: { mana: "{7}{R}", tap: false },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "{7}{R}: This creature deals damage equal to its power to target player or planeswalker.",
    },
  ],
});
