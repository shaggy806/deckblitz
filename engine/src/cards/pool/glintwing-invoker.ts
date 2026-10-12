import { defineCard } from "../define.js";

export default defineCard({
  name: "Glintwing Invoker",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Mutant"],
  power: 3,
  toughness: 3,
  text: "{7}{U}: This creature gets +3/+3 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{7}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 3,
            toughness: 3,
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
      text: "{7}{U}: This creature gets +3/+3 and gains flying until end of turn.",
    },
  ],
});
