import { defineCard } from "../define.js";

// EDHREC rank 23531.

const TEXT = "{2}{R}, Sacrifice a land: Draw a card and put a +1/+1 counter on She-Hulk.";

export default defineCard({
  name: "She-Hulk, Jennifer Walters",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Berserker", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player she's attacking.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
