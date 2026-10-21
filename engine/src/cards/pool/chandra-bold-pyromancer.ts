import { defineCard } from "../define.js";

export default defineCard({
  name: "Chandra, Bold Pyromancer",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: "+1: Add {R}{R}. Chandra deals 2 damage to target player.\n−3: Chandra deals 3 damage to target creature or planeswalker.\n−7: Chandra deals 10 damage to target player and each creature and planeswalker they control.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "R", amount: 2 },
          { kind: "damage", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: "+1: Add {R}{R}. Chandra deals 2 damage to target player.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "−3: Chandra deals 3 damage to target creature or planeswalker.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 10, target: 0 },
          {
            kind: "damage-all",
            filter: { typesAnyOf: ["creature", "planeswalker"] },
            controlledByTarget: 0,
            amount: 10,
          },
        ],
      },
      resolve: null,
      text: "−7: Chandra deals 10 damage to target player and each creature and planeswalker they control.",
    },
  ],
});
