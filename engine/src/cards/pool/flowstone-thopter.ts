import { defineCard } from "../define.js";

export default defineCard({
  name: "Flowstone Thopter",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 4,
  toughness: 4,
  text: "{1}: This creature gets +1/-1 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
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
      text: "{1}: This creature gets +1/-1 and gains flying until end of turn.",
    },
  ],
});
