import { defineCard } from "../define.js";

export default defineCard({
  name: "Megatog",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 3,
  toughness: 4,
  text: "Sacrifice an artifact: This creature gets +3/+3 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
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
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Sacrifice an artifact: This creature gets +3/+3 and gains trample until end of turn.",
    },
  ],
});
