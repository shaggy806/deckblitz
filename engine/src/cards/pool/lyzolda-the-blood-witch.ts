import { defineCard } from "../define.js";

// Dissension. The target is chosen whatever is sacrificed (the ruling); each
// half reads the sacrificed creature's colours as it last existed. A creature
// that's neither red nor black does nothing, and an illegal target stops the
// whole ability, the draw included (the rulings).
const TEXT =
  "{2}, Sacrifice a creature: Lyzolda deals 2 damage to any target if the sacrificed creature was red. Draw a card if the sacrificed creature was black.";

export default defineCard({
  name: "Lyzolda, the Blood Witch",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "creature-you-control" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { colors: ["R"] } },
            then: { kind: "damage", amount: 2, target: 0 },
          },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { colors: ["B"] } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
