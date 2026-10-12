import { defineCard } from "../define.js";

export default defineCard({
  name: "Leaping Lizard",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 3,
  text: "{1}{G}: This creature gets -0/-1 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 0,
            toughness: -1,
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
      text: "{1}{G}: This creature gets -0/-1 and gains flying until end of turn.",
    },
  ],
});
