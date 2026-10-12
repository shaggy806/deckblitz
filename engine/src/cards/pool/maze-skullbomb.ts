import { defineCard } from "../define.js";

export default defineCard({
  name: "Maze Skullbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}, Sacrifice this artifact: Draw a card.\n{2}{G}, Sacrifice this artifact: Target creature you control gets +3/+3 and gains trample until end of turn. Draw a card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Draw a card.",
    },
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            ],
          },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}{G}, Sacrifice this artifact: Target creature you control gets +3/+3 and gains trample until end of turn. Draw a card. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
