import { defineCard } from "../define.js";

const POPULATE = "{T}, Remove a counter from another permanent you control: Populate. Activate only as a sorcery.";
const PROLIFERATE = "{T}, Sacrifice another creature: Proliferate. Activate only as a sorcery.";

export default defineCard({
  name: "Xavier Sal, Infested Captain",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Fungus", "Pirate"],
  power: 3,
  toughness: 3,
  text: `${POPULATE} (Create a token that's a copy of a creature token you control.)\n${PROLIFERATE} (Choose any number of permanents and/or players, then give each another counter of each kind already there.)`,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "any", count: 1, from: {}, excludeSource: true },
      },
      targets: [],
      effect: { kind: "populate" },
      resolve: null,
      text: POPULATE,
      sorcerySpeed: true,
    },
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE,
      otherOnly: true,
      sorcerySpeed: true,
    },
  ],
});
