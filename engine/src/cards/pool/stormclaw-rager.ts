import { defineCard } from "../define.js";

// EDHREC rank 11226.

const TEXT =
  "{1}, Sacrifice another creature or artifact: Put a +1/+1 counter on this creature and draw a card. Activate only as a sorcery.";

export default defineCard({
  name: "Stormclaw Rager",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      otherOnly: true,
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
