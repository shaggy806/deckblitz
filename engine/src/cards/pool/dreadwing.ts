import { defineCard } from "../define.js";

export default defineCard({
  name: "Dreadwing",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "{1}{U}{R}: This creature gets +3/+0 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 3,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "flying",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{1}{U}{R}: This creature gets +3/+0 and gains flying until end of turn.",
    },
  ],
});
