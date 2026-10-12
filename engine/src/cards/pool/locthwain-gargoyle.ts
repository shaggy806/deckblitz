import { defineCard } from "../define.js";

export default defineCard({
  name: "Locthwain Gargoyle",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 0,
  toughness: 3,
  text: "{4}: This creature gets +2/+0 and gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 2,
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
      text: "{4}: This creature gets +2/+0 and gains flying until end of turn.",
    },
  ],
});
