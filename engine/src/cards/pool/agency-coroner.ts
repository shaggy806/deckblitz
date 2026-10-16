import { defineCard } from "../define.js";

// "If the sacrificed creature was suspected" reads it as it last existed on
// the battlefield (the `sacrificed` condition).

const TEXT =
  "{2}{B}, Sacrifice another creature: Draw a card. If the sacrificed creature was suspected, draw two cards instead.";

export default defineCard({
  name: "Agency Coroner",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Cleric"],
  power: 3,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { suspected: true } },
        then: { kind: "draw", amount: 2 },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
