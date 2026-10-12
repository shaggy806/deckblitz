import { defineCard } from "../define.js";

export default defineCard({
  name: "Miner's Bane",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 3,
  text: "{2}{R}: This creature gets +1/+0 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{2}{R}: This creature gets +1/+0 and gains trample until end of turn.",
    },
  ],
});
