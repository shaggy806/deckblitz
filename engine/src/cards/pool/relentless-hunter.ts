import { defineCard } from "../define.js";

export default defineCard({
  name: "Relentless Hunter",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: "{1}{R}{G}: This creature gets +1/+1 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: 1,
            toughness: 1,
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
      text: "{1}{R}{G}: This creature gets +1/+1 and gains trample until end of turn.",
    },
  ],
});
